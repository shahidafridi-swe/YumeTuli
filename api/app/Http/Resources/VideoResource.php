<?php

namespace App\Http\Resources;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Video */
class VideoResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'language' => $this->language,
            'mode' => $this->mode,
            'status' => $this->status,
            'context' => $this->context,
            'script' => $this->script,
            'plan' => $this->plan,
            'target_seconds' => $this->target_seconds,
            'series' => new SeriesResource($this->whenLoaded('series')),
            'voice' => new AssetResource($this->whenLoaded('voice')),
            'current_version' => new VideoVersionResource($this->whenLoaded('currentVersion')),
            'versions' => VideoVersionResource::collection($this->whenLoaded('versions')),
            'active_run' => new RunResource($this->whenLoaded('activeRun')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
