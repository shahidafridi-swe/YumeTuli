<?php

namespace App\Services\Runs;

use App\Enums\AssetKind;
use App\Models\Video;
use App\Models\VideoVersion;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * The video's folder inside the engine (`inbox/<video id>/`): inputs for Claude,
 * the plan file, and importing the finished files back into media storage.
 */
class Workspace
{
    public function __construct(private ?string $engine = null)
    {
        $this->engine = rtrim($engine ?? config('yumetuli.engine_path'), '/');
    }

    public function enginePath(): string
    {
        return $this->engine;
    }

    /** Paths relative to the engine root, as Claude sees them. */
    public function dir(Video $video): string
    {
        return 'inbox/'.$video->id;
    }

    public function planPath(Video $video): string
    {
        return $this->dir($video).'/plan.md';
    }

    /**
     * Writes script, brief and voice into the inbox.
     *
     * @return array{script: string, brief: string, voice: string, plan: string}
     */
    public function prepare(Video $video): array
    {
        $dir = $this->dir($video);
        $abs = $this->engine.'/'.$dir;
        if (! is_dir($abs) && ! mkdir($abs, 0775, true) && ! is_dir($abs)) {
            throw new RuntimeException("Cannot create {$abs}");
        }

        file_put_contents("{$abs}/script.md", $video->script);
        file_put_contents("{$abs}/brief.md", $this->brief($video));

        $voice = $video->voice ?? throw new RuntimeException('The video has no voice file.');
        $ext = pathinfo($voice->path, PATHINFO_EXTENSION) ?: 'mp3';
        $voicePath = "{$dir}/voice.{$ext}";
        $in = Storage::disk($voice->disk)->readStream($voice->path);
        $out = fopen("{$this->engine}/{$voicePath}", 'wb');
        stream_copy_to_stream($in, $out);
        fclose($in);
        fclose($out);

        return [
            'script' => "{$dir}/script.md",
            'brief' => "{$dir}/brief.md",
            'voice' => $voicePath,
            'plan' => $this->planPath($video),
        ];
    }

    public function readPlan(Video $video): ?string
    {
        $file = $this->engine.'/'.$this->planPath($video);

        return is_file($file) ? file_get_contents($file) : null;
    }

    public function writePlan(Video $video, string $plan): void
    {
        $file = $this->engine.'/'.$this->planPath($video);
        @mkdir(dirname($file), 0775, true);
        file_put_contents($file, $plan);
    }

    /**
     * Copies the files named in RESULT into media storage as a new version.
     *
     * @param  array<string, mixed>  $result
     */
    public function importVersion(Video $video, array $result, ?string $feedback): VideoVersion
    {
        $files = [
            AssetKind::Mp4->value => $this->resolve($result['mp4'] ?? null, required: true),
            AssetKind::Zip->value => $this->resolve($result['zip'] ?? null),
            AssetKind::Thumb->value => $this->resolve($result['thumb'] ?? null),
        ];

        $number = (int) $video->versions()->max('number') + 1;
        $version = $video->versions()->create([
            'number' => $number,
            'feedback' => $feedback,
            'duration_sec' => is_numeric($result['duration'] ?? null) ? (float) $result['duration'] : $this->probeDuration($files['mp4']),
        ]);

        $disk = config('yumetuli.media_disk');
        foreach ($files as $kind => $abs) {
            if ($abs === null) {
                continue;
            }
            $ext = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
            $target = "{$video->mediaDirectory()}/v{$number}/".basename($video->slug)."-v{$number}.{$ext}";
            $stream = fopen($abs, 'rb');
            Storage::disk($disk)->writeStream($target, $stream);
            fclose($stream);

            $version->assets()->create([
                'video_id' => $video->id,
                'kind' => $kind,
                'disk' => $disk,
                'path' => $target,
                'original_name' => basename($target),
                'size' => filesize($abs),
                'mime' => mime_content_type($abs) ?: null,
            ]);
        }

        return $version;
    }

    /** Engine-relative path → absolute path, refusing anything outside the engine. */
    private function resolve(mixed $path, bool $required = false): ?string
    {
        if (! is_string($path) || $path === '' || $path === 'null') {
            if ($required) {
                throw new RuntimeException('RESULT has no mp4 path.');
            }

            return null;
        }

        $abs = realpath(str_starts_with($path, '/') ? $path : "{$this->engine}/{$path}");
        $root = realpath($this->engine);
        if ($abs === false || ! is_file($abs) || $root === false || ! str_starts_with($abs, $root.'/')) {
            if ($required) {
                throw new RuntimeException("Output file not found in the engine: {$path}");
            }

            return null;
        }

        return $abs;
    }

    private function probeDuration(string $file): ?float
    {
        $out = @shell_exec('ffprobe -v error -show_entries format=duration -of csv=p=0 '.escapeshellarg($file));

        return is_numeric(trim((string) $out)) ? round((float) $out, 2) : null;
    }

    private function brief(Video $video): string
    {
        $series = $video->series;

        return implode("\n", [
            "# {$video->title}",
            '',
            '- Project: '.($series->project?->name ?? '—'),
            "- Series: {$series->name}",
            "- Language: {$video->language->value}",
            "- Format: {$video->format->describe()}",
            '- Target length: '.($video->target_seconds ? "{$video->target_seconds} s" : 'follow the voice'),
            '',
            '## Context from the owner',
            '',
            $video->context ?: '(none)',
            '',
        ]);
    }
}
