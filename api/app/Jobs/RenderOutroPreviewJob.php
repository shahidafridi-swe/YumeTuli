<?php

namespace App\Jobs;

use App\Enums\OutroMode;
use App\Models\Project;
use App\Services\Runs\ProjectBrand;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;

/** Renders the project's outro (vertical + landscape) so the owner can watch it on the project page. */
class RenderOutroPreviewJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 900;

    public function __construct(public int $projectId) {}

    public function handle(ProjectBrand $brand): void
    {
        $project = Project::find($this->projectId);
        if (! $project) {
            return;
        }
        $project->update(['outro_status' => 'rendering', 'outro_error' => null]);

        try {
            $disk = Storage::disk(config('yumetuli.media_disk'));
            if ($project->outro_mode === OutroMode::None) {
                foreach (['outro_preview_vertical', 'outro_preview_landscape'] as $column) {
                    if ($project->{$column}) {
                        $disk->delete($project->{$column});
                    }
                }
                $project->update(['outro_preview_vertical' => null, 'outro_preview_landscape' => null, 'outro_status' => 'idle']);

                return;
            }

            $synced = $brand->sync($project);
            $engine = config('yumetuli.engine_path');

            if ($project->outro_mode === OutroMode::Video && $synced['outro']['outro'] === 'video') {
                $duration = $this->probe("{$engine}/public/{$synced['outro']['outro_video']}");
                $project->update(['outro_duration_sec' => $duration]);
                $synced = $brand->sync($project->fresh());
            }
            if (! $synced['outro']['outro']) {
                throw new RuntimeException('The outro needs a logo (common) or a video file (upload).');
            }

            $paths = [];
            foreach (['vertical', 'landscape'] as $format) {
                $out = "out/outro-previews/{$project->slug}-{$format}.mp4";
                $props = json_encode([...$synced['outro'], 'format' => $format], JSON_UNESCAPED_SLASHES);
                $process = new Process(
                    ['npx', 'remotion', 'render', 'src/index.ts', 'OutroPreview', $out, "--props={$props}", '--log=error'],
                    $engine, null, null, 600,
                );
                $process->mustRun();

                $target = "{$project->mediaDirectory()}/outro-preview-{$format}.mp4";
                $stream = fopen("{$engine}/{$out}", 'rb');
                $disk->writeStream($target, $stream);
                fclose($stream);
                $paths["outro_preview_{$format}"] = $target;
            }

            $project->update([...$paths, 'outro_status' => 'idle']);
        } catch (Throwable $e) {
            $project->update(['outro_status' => 'failed', 'outro_error' => mb_substr($e->getMessage(), 0, 2000)]);
        }
    }

    private function probe(string $file): float
    {
        $process = new Process(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', $file]);
        $process->mustRun();
        $seconds = (float) trim($process->getOutput());
        if ($seconds <= 0 || $seconds > 30) {
            throw new RuntimeException('The outro video must be between 0 and 30 seconds long.');
        }

        return round($seconds, 2);
    }
}
