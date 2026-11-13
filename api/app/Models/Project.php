<?php

namespace App\Models;

use App\Enums\OutroMode;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/** One channel/page: its logo and outro apply to every video in its series. */
#[Fillable([
    'slug', 'name', 'logo_path', 'logo_alt_path', 'logo_ratio', 'outro_mode', 'outro_key', 'outro_brief',
    'outro_video_path', 'outro_duration_sec', 'outro_preview_vertical', 'outro_preview_landscape',
    'outro_status', 'outro_error',
])]
class Project extends Model
{
    use HasFactory;

    /** Files that can be served through signed links. */
    public const FILES = [
        'logo' => 'logo_path',
        'logo_alt' => 'logo_alt_path',
        'outro_video' => 'outro_video_path',
        'preview_vertical' => 'outro_preview_vertical',
        'preview_landscape' => 'outro_preview_landscape',
    ];

    protected function casts(): array
    {
        return [
            'outro_mode' => OutroMode::class,
            'logo_ratio' => 'float',
            'outro_duration_sec' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (Project $project) {
            Storage::disk(config('yumetuli.media_disk'))->deleteDirectory($project->mediaDirectory());
        });
    }

    /** @return HasMany<Series, $this> */
    public function series(): HasMany
    {
        return $this->hasMany(Series::class)->orderBy('name');
    }

    /** @return HasManyThrough<Video, Series, $this> */
    public function videos(): HasManyThrough
    {
        return $this->hasManyThrough(Video::class, Series::class);
    }

    public function mediaDirectory(): string
    {
        return 'projects/'.$this->getKey();
    }

    public function fileUrl(string $kind): ?string
    {
        $column = self::FILES[$kind] ?? null;
        if (! $column || ! $this->{$column}) {
            return null;
        }

        return URL::temporarySignedRoute(
            'projects.file',
            now()->addMinutes(config('yumetuli.signed_url_minutes')),
            ['project' => $this->getKey(), 'kind' => $kind, 'v' => substr(md5((string) $this->{$column}), 0, 8)],
        );
    }

    /** Engine folder for this project's brand files (logo, outro video, custom outro sound). */
    public function engineBrandDir(): string
    {
        return 'public/brand/projects/'.$this->slug;
    }
}
