<?php

namespace App\Models;

use App\Enums\AssetKind;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

#[Fillable(['video_id', 'video_version_id', 'kind', 'disk', 'path', 'original_name', 'size', 'mime'])]
class Asset extends Model
{
    protected function casts(): array
    {
        return ['kind' => AssetKind::class, 'size' => 'integer'];
    }

    protected static function booted(): void
    {
        static::deleting(function (Asset $asset) {
            Storage::disk($asset->disk)->delete($asset->path);
        });
    }

    /** @return BelongsTo<Video, $this> */
    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    /** Short-lived signed link (works in <audio>/<video> tags, which can't send the JWT). */
    public function signedUrl(): string
    {
        return URL::temporarySignedRoute(
            'assets.download',
            now()->addMinutes(config('yumetuli.signed_url_minutes')),
            ['asset' => $this->getKey()],
        );
    }
}
