<?php

namespace App\Services\Runs;

use App\Enums\RunKind;
use App\Models\Run;
use App\Models\Video;

class PromptBuilder
{
    /**
     * @param  array{script: string, brief: string, voice: string, plan: string}  $paths
     * @param  array{logo: ?string, logo_alt: ?string, outro: array<string, mixed>}  $brand  from ProjectBrand::sync
     */
    public function build(Run $run, Video $video, array $paths, array $brand): string
    {
        $series = $video->series;
        $project = $series->project;
        $template = file_get_contents(resource_path("prompts/{$run->kind->value}.md"));

        return strtr($template, [
            '{{id}}' => (string) $video->id,
            '{{title}}' => $video->title,
            '{{series_name}}' => $series->name,
            '{{project_name}}' => $project?->name ?? $series->name,
            '{{folder}}' => $series->folder,
            '{{slug}}' => $video->slug,
            '{{language}}' => $video->language->value,
            '{{format}}' => $video->format->value,
            '{{format_desc}}' => $video->format->describe(),
            '{{target}}' => $video->target_seconds ? "{$video->target_seconds} seconds" : 'follow the voice length',
            '{{logo}}' => $brand['logo'] ?? '(none)',
            '{{logo_alt}}' => $brand['logo_alt'] ? "; alternative for light backgrounds: `{$brand['logo_alt']}`" : '',
            '{{outro_json}}' => json_encode(array_filter($brand['outro'], fn ($v) => $v !== null) ?: ['outro' => null], JSON_UNESCAPED_SLASHES),
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
