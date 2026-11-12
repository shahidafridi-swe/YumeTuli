<?php

namespace App\Http\Resources;

use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Series */
class SeriesResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'folder' => $this->folder,
            'logo_path' => $this->logo_path,
            'outro' => $this->outro,
            'theme' => $this->theme,
            'rules' => $this->rules,
            'videos_count' => $this->whenCounted('videos'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
