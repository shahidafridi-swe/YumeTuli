<?php

namespace App\Http\Resources;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Asset */
class AssetResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'original_name' => $this->original_name,
            'size' => $this->size,
            'mime' => $this->mime,
            'url' => $this->signedUrl(),
            'created_at' => $this->created_at,
        ];
    }
}
