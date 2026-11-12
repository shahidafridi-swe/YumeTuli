<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'folder', 'logo_path', 'outro', 'theme', 'rules'])]
class Series extends Model
{
    use HasFactory;

    protected $table = 'series';

    protected function casts(): array
    {
        return ['theme' => 'array'];
    }

    /** @return HasMany<Video, $this> */
    public function videos(): HasMany
    {
        return $this->hasMany(Video::class);
    }
}
