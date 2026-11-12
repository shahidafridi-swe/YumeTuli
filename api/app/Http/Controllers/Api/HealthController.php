<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $database = $this->check(fn () => DB::connection()->getPdo() && DB::select('select 1'));

        return response()->json([
            'app' => config('app.name'),
            'laravel' => app()->version(),
            'php' => PHP_VERSION,
            'database' => $database,
            'time' => now()->toIso8601String(),
        ], $database === 'ok' ? 200 : 503);
    }

    private function check(callable $probe): string
    {
        try {
            $probe();

            return 'ok';
        } catch (Throwable) {
            return 'down';
        }
    }
}
