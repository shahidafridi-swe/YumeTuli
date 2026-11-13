<?php

namespace Database\Seeders;

use App\Enums\OutroMode;
use App\Models\Project;
use App\Models\Series;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * House projects (channels) and their series, from the ai-video rules in docs/memory. Safe to re-run:
 * existing rows are updated, and logos are imported from the engine only when the project has none yet.
 */
class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $devDiary = $this->project('devdiary', 'Dev Diary by Afridi', 'devdiary', 'dev-diary-logo.png', 'dev-diary-logo-black.png');
        $hizibizi = $this->project('hizibizi', 'hizibizi', 'hizibizi', 'hizibizi-logo.png', null);

        $this->series($devDiary, ['design-patterns', 'devdiary'], 'Design Patterns', 'design-patterns', [
            'title_top' => 300,
            'caption_bottom' => 300,
        ], <<<'MD'
            Design patterns in PHP/Laravel for beginner developers, Bangla voice.
            - 3–5 PHP lines per shot; highlight the narrated line; highlight label in the code panel header.
            - Captions max 2 lines, synced to the voice; expression tags never shown.
            - Content vertically centred (space above logo = space below captions).
            - Logos as given (transparent, no plate). Main logo is white (dark backgrounds); the alternative
              black logo is for light backgrounds such as the Observer series (ivory, charcoal, plum, burnt orange).
            - Deliverables: the video and the thumbnail only.
            MD);

        $this->series($hizibizi, ['why-is-that', 'hizibizi'], 'Why Is That?', 'hizibizi', [
            'caption_style' => 'shadow',
            'logo_top' => 141,
            'caption_bottom' => 145,
        ], <<<'MD'
            Kids science explainers, Bangla voice, code-drawn SVG animation.
            - Full-screen: no card, border or panel; backgrounds overscan; shadow captions.
            - Centre with StagePage (SHIFT); logo top-right as given.
            - Light SFX via scripts/zip-sfx.py. Original characters only.
            - Deliverables: the video and the thumbnail only.
            MD);
    }

    private function project(string $slug, string $name, string $outroKey, string $logo, ?string $logoAlt): Project
    {
        $project = Project::firstOrNew(['slug' => $slug]);
        $project->name = $name;
        if (! $project->exists) {
            $project->outro_mode = OutroMode::Custom;
            $project->outro_key = $outroKey;
        }
        $project->save();

        if (! $project->logo_path && ($path = $this->import($project, $logo, 'logo'))) {
            $size = @getimagesize(Storage::disk(config('yumetuli.media_disk'))->path($path));
            $project->update(['logo_path' => $path, 'logo_ratio' => $size ? round($size[0] / max(1, $size[1]), 4) : null]);
        }
        if ($logoAlt && ! $project->logo_alt_path && ($path = $this->import($project, $logoAlt, 'logo-alt'))) {
            $project->update(['logo_alt_path' => $path]);
        }

        return $project;
    }

    /** @param list<string> $slugs  new slug first, then older slugs to rename */
    private function series(Project $project, array $slugs, string $name, string $folder, array $theme, string $rules): void
    {
        $series = Series::whereIn('slug', $slugs)->orderByRaw('slug = ? desc', [$slugs[0]])->first() ?? new Series;
        $series->fill([
            'project_id' => $project->id,
            'slug' => $slugs[0],
            'name' => $name,
            'folder' => $folder,
            'theme' => $theme,
            'rules' => $rules,
        ])->save();
    }

    private function import(Project $project, string $file, string $name): ?string
    {
        $source = config('yumetuli.engine_path')."/public/brand/{$file}";
        if (! is_file($source)) {
            $this->command?->warn("Logo not found in the engine: {$file} (skipped)");

            return null;
        }
        $target = "{$project->mediaDirectory()}/{$name}-seed.".pathinfo($file, PATHINFO_EXTENSION);
        Storage::disk(config('yumetuli.media_disk'))->put($target, file_get_contents($source));

        return $target;
    }
}
