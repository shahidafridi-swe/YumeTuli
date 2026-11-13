<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SeriesRequest;
use App\Http\Resources\SeriesResource;
use App\Models\Series;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SeriesController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return SeriesResource::collection(Series::with('project')->withCount('videos')->orderBy('name')->get());
    }

    public function store(SeriesRequest $request): JsonResponse
    {
        $series = Series::create($request->validated());

        return (new SeriesResource($series))->response()->setStatusCode(201);
    }

    public function show(Series $series): SeriesResource
    {
        return new SeriesResource($series->load('project')->loadCount('videos'));
    }

    public function update(SeriesRequest $request, Series $series): SeriesResource
    {
        $series->update($request->validated());

        return new SeriesResource($series);
    }

    public function destroy(Series $series): Response|JsonResponse
    {
        if ($series->videos()->exists()) {
            return response()->json(['message' => __('api.series_in_use')], 409);
        }

        $series->delete();

        return response()->noContent();
    }
}
