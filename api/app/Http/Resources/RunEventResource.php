<?php

namespace App\Http\Resources;

use App\Models\RunEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin RunEvent */
class RunEventResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'run_id' => $this->run_id,
            'type' => $this->type,
            'step' => $this->step,
            'message' => $this->message,
            'payload' => $this->payload,
            'created_at' => $this->created_at,
        ];
    }
}
