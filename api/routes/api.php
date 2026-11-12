<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\SeriesController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
});

// Signed links for <audio>/<video> tags and downloads (no JWT header possible there).
Route::get('/assets/{asset}/download', [AssetController::class, 'download'])
    ->middleware('signed')
    ->name('assets.download');

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateMe']);

    Route::apiResource('series', SeriesController::class)->parameters(['series' => 'series']);
    Route::apiResource('videos', VideoController::class);
});
