<?php

namespace App\Jobs;

use App\Enums\OutroMode;
use App\Models\Project;
use App\Services\Runs\ClaudeProcess;
use App\Services\Runs\ProjectBrand;
use App\Services\Runs\StreamParser;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/** Claude designs an animated outro for the project's logo, then the preview is rendered. */
class GenerateCustomOutroJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 3600;

    public function __construct(public int $projectId) {}

    public function handle(ProjectBrand $brand, ClaudeProcess $claude): void
    {
        $project = Project::find($this->projectId);
        if (! $project) {
            return;
        }
        $project->update(['outro_status' => 'generating', 'outro_error' => null]);

        try {
            $synced = $brand->sync($project);
            if (! $synced['logo']) {
                throw new RuntimeException('Upload a logo first.');
            }

            $key = 'p-'.Str::slug($project->slug);
            $dir = "inbox/outro-{$key}";
            @mkdir(config('yumetuli.engine_path')."/{$dir}", 0775, true);
            // Tracked in git with the outro code (public/brand/projects/ is a generated copy and ignored).
            $sfx = "brand/custom/{$key}-sfx.wav";

            $prompt = strtr(file_get_contents(resource_path('prompts/custom-outro.md')), [
                '{{name}}' => $project->name,
                '{{logo}}' => $synced['logo'],
                '{{ratio}}' => (string) ($project->logo_ratio ?? 'unknown'),
                '{{brief}}' => trim((string) $project->outro_brief) ?: 'a clean, confident logo reveal',
                '{{key}}' => $key,
                '{{dir}}' => $dir,
                '{{sfx}}' => $sfx,
            ]);

            $parser = new StreamParser;
            $outcome = $claude->run(
                prompt: $prompt,
                resumeSession: null,
                maxTurns: 120,
                onLine: fn (string $line) => $parser->parse($line),
                shouldCancel: fn () => false,
            );

            $text = (string) ($parser->result['result'] ?? '');
            if ($outcome['timed_out'] || ! $parser->result || ($parser->result['is_error'] ?? false) || ! str_contains($text, "OUTRO_READY {$key}")) {
                throw new RuntimeException('Claude could not finish the outro. '.mb_substr($text, -500));
            }

            $project->update(['outro_mode' => OutroMode::Custom, 'outro_key' => $key]);
            (new RenderOutroPreviewJob($project->id))->handle($brand);
        } catch (Throwable $e) {
            $project->update(['outro_status' => 'failed', 'outro_error' => mb_substr($e->getMessage(), 0, 2000)]);
        }
    }
}
