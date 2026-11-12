<?php

namespace App\Enums;

enum AssetKind: string
{
    case Voice = 'voice';
    case Upload = 'upload';
    case Mp4 = 'mp4';
    case Zip = 'zip';
    case Thumb = 'thumb';
}
