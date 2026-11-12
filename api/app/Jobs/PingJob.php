<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/** Smoke test for the queue worker: `php artisan tinker --execute="App\Jobs\PingJob::dispatch()"`. */
class PingJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Log::info('PingJob handled by worker', ['node' => trim((string) shell_exec('node -v'))]);
    }
}
