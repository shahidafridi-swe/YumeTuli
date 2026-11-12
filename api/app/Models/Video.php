<?php

namespace App\Models;

use App\Enums\AssetKind;
use App\Enums\Language;
use App\Enums\VideoMode;
use App\Enums\VideoStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable(['series_id', 'title', 'slug', 'language', 'context', 'script', 'target_seconds', 'mode', 'status'])]
class Video extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'language' => Language::class,
            'mode' => VideoMode::class,
            'status' => VideoStatus::class,
            'target_seconds' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // Remove the video's files with it (DB rows cascade).
        static::deleting(function (Video $video) {
            Storage::disk(config('yumetuli.media_disk'))->deleteDirectory($video->mediaDirectory());
        });
    }

    /** @return BelongsTo<Series, $this> */
    public function series(): BelongsTo
    {
        return $this->belongsTo(Series::class);
    }

    /** @return HasMany<VideoVersion, $this> */
    public function versions(): HasMany
    {
        return $this->hasMany(VideoVersion::class)->orderByDesc('number');
    }

    /** @return BelongsTo<VideoVersion, $this> */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(VideoVersion::class, 'current_version_id');
    }

    /** @return HasMany<Asset, $this> */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /** @return HasOne<Asset, $this> */
    public function voice(): HasOne
    {
        return $this->hasOne(Asset::class)->where('kind', AssetKind::Voice)->latestOfMany();
    }

    public function mediaDirectory(): string
    {
        return 'videos/'.$this->getKey();
    }

    /**
     * Engine project slug: "<series folder>/<title slug>-<language>", unique.
     * Bangla titles have no ASCII slug, so they fall back to "video".
     */
    public static function makeSlug(Series $series, string $title, Language $language): string
    {
        $base = Str::slug(Str::ascii($title)) ?: 'video';
        $base = Str::limit($base, 60, '');
        $slug = "{$series->folder}/{$base}-{$language->value}";

        $n = 2;
        while (static::where('slug', $slug)->exists()) {
            $slug = "{$series->folder}/{$base}-{$n}-{$language->value}";
            $n++;
        }

        return $slug;
    }
}
