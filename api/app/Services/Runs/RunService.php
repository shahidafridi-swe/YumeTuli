<?php

namespace App\Services\Runs;

use App\Enums\RunKind;
use App\Enums\RunStatus;
use App\Enums\VideoStatus;
use App\Jobs\RunVideoJob;
use App\Models\Run;
use App\Models\Video;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/** Video state machine: which run may start from which status, plus cancel. */
class RunService
{
    /** Video statuses each run kind may start from. */
    private const ALLOWED = [
        'plan' => [VideoStatus::Draft, VideoStatus::AwaitingApproval, VideoStatus::Failed],
        'build' => [VideoStatus::AwaitingApproval],
        'feedback' => [VideoStatus::Review, VideoStatus::Ready],
    ];

    public function __construct(private LiveFeed $feed) {}

    public function start(Video $video, RunKind $kind, ?string $input = null): Run
    {
        $run = DB::transaction(function () use ($video, $kind, $input) {
            $video = Video::whereKey($video->id)->lockForUpdate()->firstOrFail();

            if ($this->activeRun($video)) {
                throw new ConflictHttpException(__('api.video_running'));
            }
            if (! in_array($video->status, self::ALLOWED[$kind->value], true)) {
                throw new ConflictHttpException(__('api.invalid_transition', ['status' => $video->status->value, 'action' => $kind->value]));
            }
            if ($kind !== RunKind::Plan && ! $video->claude_session_id) {
                throw new ConflictHttpException(__('api.no_session'));
            }

            $video->update(['status' => VideoStatus::Queued]);

            return $video->runs()->create([
                'kind' => $kind,
                'status' => RunStatus::Queued,
                'input' => $input,
            ]);
        });

        $this->feed->runChanged($run);
        RunVideoJob::dispatch($run->id);

        return $run;
    }

    /** Re-run the last failed run with the same kind and input. */
    public function retry(Video $video): Run
    {
        $last = $video->runs()->first();
        if ($video->status !== VideoStatus::Failed || ! $last) {
            throw new ConflictHttpException(__('api.invalid_transition', ['status' => $video->status->value, 'action' => 'retry']));
        }

        // Let the failed video re-enter the state the last run started from.
        $video->update(['status' => self::restingStatus($video, $last->kind)]);

        return $this->start($video->fresh(), $last->kind, $last->input);
    }

    public function cancel(Video $video): Run
    {
        $run = $this->activeRun($video) ?? throw new ConflictHttpException(__('api.no_active_run'));

        if ($run->status === RunStatus::Queued) {
            // The worker has not picked it up yet: cancel right away.
            $run->update(['status' => RunStatus::Cancelled, 'cancel_requested' => true, 'finished_at' => now()]);
            $video->update(['status' => self::restingStatus($video, $run->kind)]);
            $this->feed->runChanged($run->fresh());
        } else {
            $run->update(['cancel_requested' => true]); // the job polls this and stops Claude
        }

        return $run->fresh();
    }

    public function markReady(Video $video): Video
    {
        if ($video->status !== VideoStatus::Review) {
            throw new ConflictHttpException(__('api.invalid_transition', ['status' => $video->status->value, 'action' => 'ready']));
        }
        $video->update(['status' => VideoStatus::Ready]);

        return $video;
    }

    public function activeRun(Video $video): ?Run
    {
        return $video->runs()->whereIn('status', [RunStatus::Queued, RunStatus::Running])->first();
    }

    /** Where a video goes back to when a run of this kind is cancelled (or retried). */
    public static function restingStatus(Video $video, RunKind $kind): VideoStatus
    {
        return match ($kind) {
            RunKind::Plan => filled($video->plan) ? VideoStatus::AwaitingApproval : VideoStatus::Draft,
            RunKind::Build => VideoStatus::AwaitingApproval,
            RunKind::Feedback => VideoStatus::Review,
        };
    }
}
