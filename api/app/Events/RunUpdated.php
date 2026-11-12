<?php

namespace App\Events;

use App\Models\Run;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/** Run status/step changed (and with it, usually the video status). */
class RunUpdated implements ShouldBroadcastNow
{
    public function __construct(public Run $run) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('video.'.$this->run->video_id);
    }

    public function broadcastAs(): string
    {
        return 'run.updated';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'run' => [
                'id' => $this->run->id,
                'kind' => $this->run->kind,
                'status' => $this->run->status,
                'current_step' => $this->run->current_step,
                'error' => $this->run->error,
                'video_version_id' => $this->run->video_version_id,
            ],
            'video' => [
                'id' => $this->run->video_id,
                'status' => $this->run->video?->status,
                'current_version_id' => $this->run->video?->current_version_id,
            ],
        ];
    }
}
