<?php

namespace App\Services\Runs;

use App\Enums\OutroMode;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Copies a project's logo(s) and uploaded outro into the engine (public/brand/projects/<slug>/)
 * and describes the outro as scenes.json fields.
 */
class ProjectBrand
{
    public function __construct(private ?string $engine = null)
    {
        $this->engine = rtrim($engine ?? config('yumetuli.engine_path'), '/');
    }

    /**
     * @return array{logo: ?string, logo_alt: ?string, outro: array<string, mixed>}
     *                                                                              paths are relative to engine/public (what staticFile() expects)
     */
    public function sync(Project $project): array
    {
        $dir = $project->engineBrandDir();
        $abs = "{$this->engine}/{$dir}";
        if (! is_dir($abs) && ! mkdir($abs, 0775, true) && ! is_dir($abs)) {
            throw new RuntimeException("Cannot create {$abs}");
        }

        $logo = $this->copy($project->logo_path, $dir, 'logo');
        $logoAlt = $this->copy($project->logo_alt_path, $dir, 'logo-alt');
        $video = $this->copy($project->outro_video_path, $dir, 'outro');

        return ['logo' => $logo, 'logo_alt' => $logoAlt, 'outro' => $this->outroFields($project, $logo, $video)];
    }

    /** @return array<string, mixed> */
    public function outroFields(Project $project, ?string $logo, ?string $video): array
    {
        return match ($project->outro_mode) {
            OutroMode::Common => $logo
                ? ['outro' => 'common', 'outro_logo' => $logo, 'outro_logo_ratio' => $project->logo_ratio]
                : ['outro' => null],
            OutroMode::Custom => ['outro' => $project->outro_key],
            OutroMode::Video => $video
                ? ['outro' => 'video', 'outro_video' => $video, 'outro_duration_sec' => $project->outro_duration_sec ?? 4]
                : ['outro' => null],
            OutroMode::None => ['outro' => null],
        };
    }

    /** media file → engine/public/<dir>/<name>.<ext>; returns the public-relative path. */
    private function copy(?string $mediaPath, string $dir, string $name): ?string
    {
        if (! $mediaPath) {
            return null;
        }
        $ext = strtolower(pathinfo($mediaPath, PATHINFO_EXTENSION));
        $target = "{$dir}/{$name}.{$ext}";
        $in = Storage::disk(config('yumetuli.media_disk'))->readStream($mediaPath);
        $out = fopen("{$this->engine}/{$target}", 'wb');
        stream_copy_to_stream($in, $out);
        fclose($in);
        fclose($out);

        return substr($target, strlen('public/'));
    }
}
