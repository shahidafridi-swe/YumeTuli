<?php

return [
    // Filesystem disk for all media files (see config/filesystems.php).
    'media_disk' => env('MEDIA_DISK', 'media'),

    // Owner account created by `php artisan db:seed` (single-user app).
    'owner' => [
        'name' => env('OWNER_NAME', 'Owner'),
        'email' => env('OWNER_EMAIL'),
        'password' => env('OWNER_PASSWORD'),
    ],

    // Signed download links expire after this many minutes.
    'signed_url_minutes' => (int) env('SIGNED_URL_MINUTES', 30),

    // UI/API languages. Add 'bn' here when lang/bn exists.
    'locales' => ['en'],

    // Upload limits (kilobytes).
    'max_voice_kb' => 50 * 1024,

    // Video engine (Remotion + scripts) and Claude Code, used by the queue worker.
    'engine_path' => env('ENGINE_PATH', '/engine'),
    'claude' => [
        'bin' => env('CLAUDE_BIN', 'claude'),
        'model' => env('CLAUDE_MODEL'), // null = account default
        'timeout' => (int) env('CLAUDE_TIMEOUT', 5400), // seconds per run
        'max_turns' => [
            'plan' => (int) env('CLAUDE_MAX_TURNS_PLAN', 60),
            'build' => (int) env('CLAUDE_MAX_TURNS_BUILD', 500),
        ],
        // Tools Claude may use inside the engine. Paths outside the engine are denied by Claude Code itself.
        'allowed_tools' => [
            'Read', 'Write', 'Edit', 'Glob', 'Grep',
            'Bash(npm run *)', 'Bash(npx remotion *)', 'Bash(npx tsc *)',
            'Bash(node scripts/*)', 'Bash(bash scripts/*)', 'Bash(scripts/*)',
            'Bash(.venv/bin/python *)', 'Bash(python3 scripts/*)',
            'Bash(ffmpeg *)', 'Bash(ffprobe *)',
            'Bash(zip *)', 'Bash(unzip *)', 'Bash(ls *)', 'Bash(mkdir *)', 'Bash(cp *)', 'Bash(mv *)',
            'Bash(cat *)', 'Bash(head *)', 'Bash(tail *)', 'Bash(wc *)', 'Bash(du *)', 'Bash(find *)',
            'Bash(grep *)', 'Bash(sed *)', 'Bash(sort *)', 'Bash(echo *)', 'Bash(diff *)',
        ],
    ],
];
