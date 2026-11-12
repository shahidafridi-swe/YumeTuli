<?php

namespace App\Http\Resources;

use App\Models\VideoVersion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin VideoVersion */
class VideoVersionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'feedback' => $this->feedback,
            'duration_sec' => $this->duration_sec,
            'assets' => AssetResource::collection($this->whenLoaded('assets')),
            'created_at' => $this->created_at,
        ];
    }
}
