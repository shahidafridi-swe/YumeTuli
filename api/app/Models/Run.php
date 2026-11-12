<?php

namespace App\Models;

use App\Enums\RunKind;
use App\Enums\RunStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'video_id', 'video_version_id', 'kind', 'status', 'input', 'current_step', 'session_id',
    'cancel_requested', 'exit_code', 'error', 'num_turns', 'cost_usd', 'started_at', 'finished_at',
])]
class Run extends Model
{
    protected function casts(): array
    {
        return [
            'kind' => RunKind::class,
            'status' => RunStatus::class,
            'cancel_requested' => 'boolean',
            'cost_usd' => 'float',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Video, $this> */
    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    /** @return BelongsTo<VideoVersion, $this> */
    public function version(): BelongsTo
    {
        return $this->belongsTo(VideoVersion::class, 'video_version_id');
    }

    /** @return HasMany<RunEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(RunEvent::class)->orderBy('id');
    }
}
