<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['run_id', 'type', 'step', 'message', 'payload'])]
class RunEvent extends Model
{
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return ['payload' => 'array', 'created_at' => 'datetime'];
    }

    /** @return BelongsTo<Run, $this> */
    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }
}
