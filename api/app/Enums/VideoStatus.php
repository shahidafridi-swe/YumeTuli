<?php

namespace App\Enums;

enum VideoStatus: string
{
    case Draft = 'draft';
    case Queued = 'queued';
    case Planning = 'planning';
    case AwaitingApproval = 'awaiting_approval';
    case Building = 'building';
    case Review = 'review';
    case Ready = 'ready';
    case Failed = 'failed';
    case Cancelled = 'cancelled';

    public function isEditable(): bool
    {
        return $this === self::Draft;
    }

    public function isRunning(): bool
    {
        return in_array($this, [self::Queued, self::Planning, self::Building], true);
    }
}
