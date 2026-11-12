<?php

namespace App\Services\Runs;

use App\Events\RunEventCreated;
use App\Events\RunUpdated;
use App\Models\Run;
use App\Models\RunEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/** Stores run events and pushes them to the browser. A broadcast failure never stops a run. */
class LiveFeed
{
    /** @param  array<string, mixed>|null  $payload */
    public function event(Run $run, string $type, ?string $message = null, ?string $step = null, ?array $payload = null): RunEvent
    {
        $event = $run->events()->create([
            'type' => $type,
            'step' => $step,
            'message' => $message === null ? null : Str::limit($message, 4000),
            'payload' => $payload,
        ]);

        $this->broadcast(new RunEventCreated($event, $run->video_id));

        return $event;
    }

    public function runChanged(Run $run): void
    {
        $run->loadMissing('video');
        $this->broadcast(new RunUpdated($run));
    }

    private function broadcast(object $event): void
    {
        try {
            broadcast($event);
        } catch (Throwable $e) {
            Log::warning('Broadcast failed: '.$e->getMessage());
        }
    }
}
