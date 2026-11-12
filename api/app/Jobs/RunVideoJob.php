<?php

namespace App\Jobs;

use App\Enums\RunKind;
use App\Enums\RunStatus;
use App\Enums\VideoStatus;
use App\Models\Run;
use App\Services\Runs\ClaudeProcess;
use App\Services\Runs\LiveFeed;
use App\Services\Runs\PromptBuilder;
use App\Services\Runs\RunService;
use App\Services\Runs\StreamParser;
use App\Services\Runs\Workspace;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

/** Runs one plan/build/feedback step with Claude Code in the engine. */
class RunVideoJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 5600; // a little above yumetuli.claude.timeout; the runner stops Claude first

    public function __construct(public int $runId) {}

    public function handle(Workspace $workspace, PromptBuilder $prompts, LiveFeed $feed, ClaudeProcess $claude): void
    {
        $run = Run::with(['video.series', 'video.voice', 'video.currentVersion'])->find($this->runId);
        if (! $run || $run->status !== RunStatus::Queued) {
            return;
        }
        $video = $run->video;

        if ($run->cancel_requested) {
            $this->finishCancelled($run, $feed);

            return;
        }

        $run->update(['status' => RunStatus::Running, 'started_at' => now(), 'current_step' => 'Preparing']);
        $video->update(['status' => $run->kind === RunKind::Plan ? VideoStatus::Planning : VideoStatus::Building]);
        $feed->runChanged($run);
        $feed->event($run, 'status', ucfirst($run->kind->value).' started', 'Preparing');

        try {
            $paths = $workspace->prepare($video);
            $prompt = $prompts->build($run, $video, $paths);
            $parser = new StreamParser;

            $outcome = $claude->run(
                prompt: $prompt,
                resumeSession: $run->kind === RunKind::Plan ? null : $video->claude_session_id,
                maxTurns: config('yumetuli.claude.max_turns.'.($run->kind === RunKind::Plan ? 'plan' : 'build')),
                onLine: function (string $line) use ($parser, $run, $feed) {
                    foreach ($parser->parse($line) as $e) {
                        if ($e['step'] && $e['step'] !== $run->current_step) {
                            $run->update(['current_step' => $e['step']]);
                            $feed->runChanged($run);
                        }
                        $feed->event($run, $e['type'], $e['message'], $e['step'], $e['payload']);
                    }
                },
                shouldCancel: fn () => (bool) Run::whereKey($run->id)->value('cancel_requested'),
            );

            $result = $parser->result;
            $run->update([
                'session_id' => $parser->sessionId,
                'exit_code' => $outcome['exit_code'],
                'num_turns' => $result['num_turns'] ?? null,
                'cost_usd' => $result['total_cost_usd'] ?? null,
            ]);

            if ($outcome['cancelled']) {
                $this->finishCancelled($run, $feed);

                return;
            }
            if ($outcome['timed_out']) {
                throw new RuntimeException(__('api.run_timed_out', ['minutes' => intdiv(config('yumetuli.claude.timeout'), 60)]));
            }
            if (! $result || ($result['is_error'] ?? false) || ($result['subtype'] ?? '') !== 'success') {
                throw new RuntimeException($this->claudeError($result, $outcome['exit_code']));
            }

            if ($run->kind === RunKind::Plan) {
                $plan = $workspace->readPlan($video);
                if (blank($plan)) {
                    throw new RuntimeException(__('api.run_no_plan'));
                }
                $video->update([
                    'plan' => $plan,
                    'status' => VideoStatus::AwaitingApproval,
                    'claude_session_id' => $parser->sessionId,
                ]);
            } else {
                $files = StreamParser::extractResult($result['result'] ?? null)
                    ?? throw new RuntimeException(__('api.run_no_result'));
                $version = $workspace->importVersion($video, $files, $run->kind === RunKind::Feedback ? $run->input : null);
                $video->update([
                    'current_version_id' => $version->id,
                    'status' => VideoStatus::Review,
                    'claude_session_id' => $parser->sessionId ?? $video->claude_session_id,
                ]);
                $run->update(['video_version_id' => $version->id]);
                $feed->event($run, 'status', "Version {$version->number} ready", 'Done');
            }

            $run->update(['status' => RunStatus::Succeeded, 'current_step' => 'Done', 'finished_at' => now()]);
        } catch (Throwable $e) {
            $this->fail_($run, $feed, $e->getMessage());
        } finally {
            $feed->runChanged($run->fresh());
        }
    }

    /** Called by the queue if the job itself dies (worker killed, hard timeout). */
    public function failed(?Throwable $e): void
    {
        $run = Run::find($this->runId);
        if ($run && ! $run->status->isFinished()) {
            $this->fail_($run, app(LiveFeed::class), $e?->getMessage() ?? 'The worker stopped.');
            app(LiveFeed::class)->runChanged($run->fresh());
        }
    }

    private function fail_(Run $run, LiveFeed $feed, string $message): void
    {
        $run->update(['status' => RunStatus::Failed, 'error' => $message, 'finished_at' => now()]);
        $run->video->update(['status' => VideoStatus::Failed]);
        $feed->event($run, 'error', $message, 'Failed');
    }

    private function finishCancelled(Run $run, LiveFeed $feed): void
    {
        $run->update(['status' => RunStatus::Cancelled, 'current_step' => 'Cancelled', 'finished_at' => now()]);
        $run->video->update(['status' => RunService::restingStatus($run->video, $run->kind)]);
        $feed->event($run, 'status', 'Cancelled', 'Cancelled');
        $feed->runChanged($run->fresh());
    }

    /** @param array<string, mixed>|null $result */
    private function claudeError(?array $result, ?int $exitCode): string
    {
        $text = (string) ($result['result'] ?? '');
        if (preg_match('/usage limit|rate limit|limit reached/i', $text)) {
            return __('api.run_usage_limit');
        }
        $message = $text !== '' ? $text : ($result['subtype'] ?? 'exit code '.($exitCode ?? '?'));

        return __('api.run_claude_error', ['message' => mb_substr($message, 0, 500)]);
    }
}
