<?php

namespace App\Enums;

enum OutroMode: string
{
    case None = 'none';
    case Common = 'common';   // project logo, house animation
    case Custom = 'custom';   // animation made by Claude for this project (engine/src/brand/custom)
    case Video = 'video';     // uploaded outro file
}
