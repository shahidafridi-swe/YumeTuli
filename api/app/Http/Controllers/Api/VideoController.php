<?php

namespace App\Http\Controllers\Api;

use App\Enums\AssetKind;
use App\Enums\Language;
use App\Enums\VideoMode;
use App\Enums\VideoStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\VideoRequest;
use App\Http\Resources\VideoResource;
use App\Models\Series;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VideoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'series_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'string'],
            'language' => ['nullable', 'string'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $videos = Video::query()
            ->with(['series', 'currentVersion'])
            ->when($filters['series_id'] ?? null, fn ($q, $v) => $q->where('series_id', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['language'] ?? null, fn ($q, $v) => $q->where('language', $v))
            ->when($filters['q'] ?? null, fn ($q, $v) => $q->where('title', 'like', '%'.$v.'%'))
            ->latest()
            ->paginate(20);

        return VideoResource::collection($videos);
    }

    public function store(VideoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $series = Series::findOrFail($data['series_id']);

        $video = DB::transaction(function () use ($data, $series, $request) {
            $video = Video::create([
                ...collect($data)->except('voice')->all(),
                'slug' => Video::makeSlug($series, $data['title'], Language::from($data['language'])),
                'mode' => $data['mode'] ?? VideoMode::Agent->value,
                'status' => VideoStatus::Draft,
            ]);
            $this->storeVoice($video, $request->file('voice'));

            return $video;
        });

        return (new VideoResource($video->load(['series', 'voice'])))->response()->setStatusCode(201);
    }

    public function show(Video $video): VideoResource
    {
        return new VideoResource($video->load(['series', 'voice', 'currentVersion.assets', 'versions.assets', 'activeRun']));
    }

    /** Edit a draft. Multipart updates must be sent as POST with _method=PATCH (PHP limitation). */
    public function update(VideoRequest $request, Video $video): VideoResource|JsonResponse
    {
        if (! $video->status->isEditable()) {
            return response()->json(['message' => __('api.video_not_editable')], 409);
        }

        $data = $request->validated();

        DB::transaction(function () use ($video, $data, $request) {
            $video->update(collect($data)->except(['voice', 'series_id', 'language'])->all());
            if ($request->hasFile('voice')) {
                $video->voice?->delete();
                $this->storeVoice($video, $request->file('voice'));
            }
        });

        return new VideoResource($video->fresh(['series', 'voice']));
    }

    public function destroy(Video $video): Response|JsonResponse
    {
        if ($video->status->isRunning()) {
            return response()->json(['message' => __('api.video_running')], 409);
        }

        $video->delete();

        return response()->noContent();
    }

    private function storeVoice(Video $video, UploadedFile $file): void
    {
        $disk = config('yumetuli.media_disk');
        $ext = strtolower($file->getClientOriginalExtension());
        $path = $file->storeAs($video->mediaDirectory(), 'voice-'.Str::random(10).'.'.$ext, $disk);

        $video->assets()->create([
            'kind' => AssetKind::Voice,
            'disk' => $disk,
            'path' => $path,
            'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ]);
    }
}
