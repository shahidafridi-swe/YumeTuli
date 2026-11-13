<?php

namespace App\Http\Resources;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Project */
class ProjectResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'logo_url' => $this->fileUrl('logo'),
            'logo_alt_url' => $this->fileUrl('logo_alt'),
            'logo_ratio' => $this->logo_ratio,
            'outro' => [
                'mode' => $this->outro_mode,
                'key' => $this->outro_key,
                'brief' => $this->outro_brief,
                'video_url' => $this->fileUrl('outro_video'),
                'duration_sec' => $this->outro_duration_sec,
                'preview_vertical_url' => $this->fileUrl('preview_vertical'),
                'preview_landscape_url' => $this->fileUrl('preview_landscape'),
                'status' => $this->outro_status,
                'error' => $this->outro_error,
            ],
            'series' => SeriesResource::collection($this->whenLoaded('series')),
            'series_count' => $this->whenCounted('series'),
            'videos_count' => $this->whenCounted('videos'),
            'updated_at' => $this->updated_at,
        ];
    }
}
