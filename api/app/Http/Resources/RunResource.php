<?php

namespace App\Http\Resources;

use App\Models\Run;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Run */
class RunResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'video_version_id' => $this->video_version_id,
            'kind' => $this->kind,
            'status' => $this->status,
            'input' => $this->input,
            'current_step' => $this->current_step,
            'cancel_requested' => $this->cancel_requested,
            'error' => $this->error,
            'num_turns' => $this->num_turns,
            'cost_usd' => $this->cost_usd,
            'started_at' => $this->started_at,
            'finished_at' => $this->finished_at,
            'created_at' => $this->created_at,
        ];
    }
}
