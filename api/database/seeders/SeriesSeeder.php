<?php

namespace Database\Seeders;

use App\Models\Series;
use Illuminate\Database\Seeder;

/** House series presets (from the ai-video rules in docs/memory). Safe to re-run. */
class SeriesSeeder extends Seeder
{
    public function run(): void
    {
        Series::updateOrCreate(['slug' => 'devdiary'], [
            'name' => 'Dev Diary by Afridi',
            'folder' => 'design-patterns',
            'logo_path' => 'brand/dev-diary-logo.png',
            'outro' => 'devdiary',
            'theme' => [
                'title_top' => 300,
                'caption_bottom' => 300,
            ],
            'rules' => <<<'MD'
                Design patterns in PHP/Laravel for beginner developers, Bangla voice.
                - 3–5 PHP lines per shot; highlight the narrated line; highlight label in the code panel header.
                - Captions max 2 lines, synced to the voice; expression tags never shown.
                - Content vertically centred (space above logo = space below captions).
                - Logos as given (transparent, no plate). Strategy: navy/teal, white logo. Observer: ivory, charcoal, plum, burnt orange, black logo.
                - Ship a runnable, tested source zip (Laravel: event discovery, feature tests, README).
                - End with the Dev Diary brand outro.
                MD,
        ]);

        Series::updateOrCreate(['slug' => 'hizibizi'], [
            'name' => 'hizibizi — Why Is That?',
            'folder' => 'hizibizi',
            'logo_path' => 'brand/hizibizi-logo.png',
            'outro' => 'hizibizi',
            'theme' => [
                'caption_style' => 'shadow',
                'logo_top' => 141,
                'caption_bottom' => 145,
            ],
            'rules' => <<<'MD'
                Kids science explainers, Bangla voice, code-drawn SVG animation.
                - Full-screen: no card, border or panel; backgrounds overscan; shadow captions.
                - Centre with StagePage (SHIFT); logo top-right as given.
                - Light SFX via scripts/zip-sfx.py. Original characters only.
                - End with the hizibizi brand outro.
                MD,
        ]);
    }
}
