<?php

namespace App\Http\Controllers\Api;

use App\Enums\RunKind;
use App\Http\Controllers\Controller;
use App\Http\Resources\RunEventResource;
use App\Http\Resources\RunResource;
use App\Http\Resources\VideoResource;
use App\Models\Run;
use App\Models\Video;
use App\Services\Runs\RunService;
use App\Services\Runs\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Plan → approve → build → feedback, plus cancel/retry and the run log. */
class VideoRunController extends Controller
{
    public function __construct(private RunService $runs) {}

    public function plan(Video $video): JsonResponse
    {
        return $this->started($this->runs->start($video, RunKind::Plan));
    }

    /** Approve the plan (optionally edited by the owner) and start the build. */
    public function approve(Request $request, Video $video, Workspace $workspace): JsonResponse
    {
        $data = $request->validate(['plan' => ['nullable', 'string', 'max:100000']]);

        if (filled($data['plan'] ?? null)) {
            $video->update(['plan' => $data['plan']]);
            $workspace->writePlan($video, $data['plan']);
        }

        return $this->started($this->runs->start($video, RunKind::Build));
    }

    public function feedback(Request $request, Video $video): JsonResponse
    {
        $data = $request->validate(['feedback' => ['required', 'string', 'max:5000']]);

        return $this->started($this->runs->start($video, RunKind::Feedback, $data['feedback']));
    }

    public function retry(Video $video): JsonResponse
    {
        return $this->started($this->runs->retry($video));
    }

    public function cancel(Video $video): RunResource
    {
        return new RunResource($this->runs->cancel($video));
    }

    public function ready(Video $video): VideoResource
    {
        return new VideoResource($this->runs->markReady($video));
    }

    public function index(Video $video): AnonymousResourceCollection
    {
        return RunResource::collection($video->runs()->limit(50)->get());
    }

    /** Log lines for one run; `after` = last event id seen (for catching up after a reconnect). */
    public function events(Request $request, Run $run): AnonymousResourceCollection
    {
        $after = (int) $request->query('after', 0);

        return RunEventResource::collection(
            $run->events()->where('id', '>', $after)->limit(500)->get()
        );
    }

    private function started(Run $run): JsonResponse
    {
        return (new RunResource($run))->response()->setStatusCode(202);
    }
}
