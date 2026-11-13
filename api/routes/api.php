<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SeriesController;
use App\Http\Controllers\Api\VideoController;
use App\Http\Controllers\Api\VideoRunController;
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

Route::get('/projects/{project}/files/{kind}', [ProjectController::class, 'file'])
    ->middleware('signed')
    ->name('projects.file');

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateMe']);

    Route::apiResource('projects', ProjectController::class);
    Route::prefix('projects/{project}')->controller(ProjectController::class)->group(function () {
        Route::post('/logo', 'uploadLogo');
        Route::post('/outro/video', 'uploadOutro');
        Route::post('/outro/custom', 'generateOutro');
        Route::post('/outro/preview', 'renderPreview');
    });

    Route::apiResource('series', SeriesController::class)->parameters(['series' => 'series']);
    Route::apiResource('videos', VideoController::class);

    Route::prefix('videos/{video}')->controller(VideoRunController::class)->group(function () {
        Route::post('/plan', 'plan');
        Route::post('/approve', 'approve');
        Route::post('/feedback', 'feedback');
        Route::post('/retry', 'retry');
        Route::post('/cancel', 'cancel');
        Route::post('/ready', 'ready');
        Route::get('/runs', 'index');
    });
    Route::get('/runs/{run}/events', [VideoRunController::class, 'events']);
});
