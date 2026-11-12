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
];
