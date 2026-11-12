<?php

namespace App\Events;

use App\Models\RunEvent;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/** One line of live progress (log, tool call, step) for the video page. */
class RunEventCreated implements ShouldBroadcastNow
{
    public function __construct(public RunEvent $event, public int $videoId) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('video.'.$this->videoId);
    }

    public function broadcastAs(): string
    {
        return 'run.event';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->event->id,
            'run_id' => $this->event->run_id,
            'type' => $this->event->type,
            'step' => $this->event->step,
            'message' => $this->event->message,
            'created_at' => $this->event->created_at?->toIso8601String(),
        ];
    }
}
