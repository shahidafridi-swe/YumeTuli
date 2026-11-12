<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['video_id', 'number', 'feedback', 'mp4_path', 'zip_path', 'thumb_path', 'duration_sec'])]
class VideoVersion extends Model
{
    protected function casts(): array
    {
        return ['duration_sec' => 'float', 'number' => 'integer'];
    }

    /** @return BelongsTo<Video, $this> */
    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }
}
