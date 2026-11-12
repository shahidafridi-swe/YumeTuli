<?php

namespace App\Enums;

enum VideoFormat: string
{
    case Vertical = 'vertical';   // 1080×1920, 9:16 (Shorts, Reels, TikTok)
    case Landscape = 'landscape'; // 1920×1080, 16:9 (YouTube)

    /** Human description used in prompts. */
    public function describe(): string
    {
        return match ($this) {
            self::Vertical => 'vertical 9:16, 1080×1920 (Shorts/Reels/TikTok); thumbnail 1080×1920',
            self::Landscape => 'landscape 16:9, 1920×1080 (YouTube); thumbnail 1280×720',
        };
    }
}
