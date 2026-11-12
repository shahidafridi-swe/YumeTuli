<?php

namespace App\Services\Runs;

use App\Enums\RunKind;
use App\Models\Run;
use App\Models\Video;

class PromptBuilder
{
    /** @param array{script: string, brief: string, voice: string, plan: string} $paths */
    public function build(Run $run, Video $video, array $paths): string
    {
        $series = $video->series;
        $template = file_get_contents(resource_path("prompts/{$run->kind->value}.md"));

        return strtr($template, [
            '{{id}}' => (string) $video->id,
            '{{title}}' => $video->title,
            '{{series_name}}' => $series->name,
            '{{folder}}' => $series->folder,
            '{{slug}}' => $video->slug,
            '{{language}}' => $video->language->value,
            '{{format}}' => $video->format->value,
            '{{format_desc}}' => $video->format->describe(),
            '{{target}}' => $video->target_seconds ? "{$video->target_seconds} seconds" : 'follow the voice length',
            '{{logo}}' => $series->logo_path ?? '(none)',
            '{{outro}}' => $series->outro ?? 'none',
            '{{theme}}' => json_encode($series->theme ?? new \stdClass, JSON_UNESCAPED_SLASHES),
            '{{rules}}' => trim($series->rules ?? '') ?: '(none)',
            '{{script_path}}' => $paths['script'],
            '{{brief_path}}' => $paths['brief'],
            '{{voice_path}}' => $paths['voice'],
            '{{plan_path}}' => $paths['plan'],
            '{{version}}' => (string) ($video->currentVersion?->number ?? '?'),
            '{{feedback}}' => $run->kind === RunKind::Feedback ? trim((string) $run->input) : '',
        ]);
    }
}
