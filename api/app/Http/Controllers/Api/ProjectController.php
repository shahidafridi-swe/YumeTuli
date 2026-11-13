<?php

namespace App\Http\Controllers\Api;

use App\Enums\OutroMode;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Jobs\GenerateCustomOutroJob;
use App\Jobs\RenderOutroPreviewJob;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/** Projects (channels/pages): logo, outro, and their series. */
class ProjectController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProjectResource::collection(Project::withCount(['series', 'videos'])->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9-]+$/', 'unique:projects,slug'],
        ]);

        return (new ProjectResource(Project::create($data)->fresh()))->response()->setStatusCode(201);
    }

    public function show(Project $project): ProjectResource
    {
        return new ProjectResource($project->load(['series' => fn ($q) => $q->withCount('videos')])->loadCount(['series', 'videos']));
    }

    /** Name and outro mode. Switching the mode re-renders the preview. */
    public function update(Request $request, Project $project): ProjectResource|JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'outro_mode' => ['sometimes', Rule::enum(OutroMode::class)],
        ]);

        $mode = isset($data['outro_mode']) ? OutroMode::from($data['outro_mode']) : null;
        if ($mode === OutroMode::Common && ! $project->logo_path) {
            return response()->json(['message' => __('api.outro_needs_logo')], 409);
        }
        if ($mode === OutroMode::Video && ! $project->outro_video_path) {
            return response()->json(['message' => __('api.outro_needs_video')], 409);
        }
        if ($mode === OutroMode::Custom && ! $project->outro_key) {
            return response()->json(['message' => __('api.outro_needs_custom')], 409);
        }

        $project->update($data);
        if ($mode !== null) {
            $this->rerender($project);
        }

        return new ProjectResource($project->fresh());
    }

    public function destroy(Project $project): Response|JsonResponse
    {
        if ($project->series()->exists()) {
            return response()->json(['message' => __('api.project_in_use')], 409);
        }
        $project->delete();

        return response()->noContent();
    }

    /** Upload the main logo (or `variant=alt` for light backgrounds). PNG/WebP/SVG keep their transparency. */
    public function uploadLogo(Request $request, Project $project): ProjectResource
    {
        $data = $request->validate([
            'logo' => ['required', 'file', 'max:5120', 'extensions:png,webp,svg', 'mimetypes:image/png,image/webp,image/svg+xml'],
            'variant' => ['sometimes', Rule::in(['main', 'alt'])],
        ]);
        $column = ($data['variant'] ?? 'main') === 'alt' ? 'logo_alt_path' : 'logo_path';
        $file = $request->file('logo');

        $this->replaceFile($project, $column, $file->storeAs(
            $project->mediaDirectory(),
            ($column === 'logo_path' ? 'logo-' : 'logo-alt-').Str::random(8).'.'.strtolower($file->getClientOriginalExtension()),
            config('yumetuli.media_disk'),
        ));

        if ($column === 'logo_path') {
            $size = @getimagesize($file->getRealPath());
            $project->update(['logo_ratio' => $size ? round($size[0] / max(1, $size[1]), 4) : null]);
            if ($project->outro_mode === OutroMode::Common) {
                $this->rerender($project);
            }
        }

        return new ProjectResource($project->fresh());
    }

    /** Upload a ready-made outro video and switch to it. */
    public function uploadOutro(Request $request, Project $project): ProjectResource
    {
        $request->validate([
            'video' => ['required', 'file', 'max:102400', 'extensions:mp4,mov,webm', 'mimetypes:video/mp4,video/quicktime,video/webm'],
        ]);
        $file = $request->file('video');
        $this->replaceFile($project, 'outro_video_path', $file->storeAs(
            $project->mediaDirectory(),
            'outro-'.Str::random(8).'.'.strtolower($file->getClientOriginalExtension()),
            config('yumetuli.media_disk'),
        ));
        $project->update(['outro_mode' => OutroMode::Video, 'outro_duration_sec' => null]);
        $this->rerender($project);

        return new ProjectResource($project->fresh());
    }

    /** Ask Claude for a custom animated outro (runs in the worker). */
    public function generateOutro(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate(['brief' => ['nullable', 'string', 'max:2000']]);
        if (! $project->logo_path) {
            return response()->json(['message' => __('api.outro_needs_logo')], 409);
        }
        if (in_array($project->outro_status, ['rendering', 'generating'], true)) {
            return response()->json(['message' => __('api.outro_busy')], 409);
        }

        $project->update(['outro_brief' => $data['brief'] ?? null, 'outro_status' => 'generating', 'outro_error' => null]);
        GenerateCustomOutroJob::dispatch($project->id);

        return (new ProjectResource($project->fresh()))->response()->setStatusCode(202);
    }

    public function renderPreview(Project $project): JsonResponse
    {
        $this->rerender($project);

        return (new ProjectResource($project->fresh()))->response()->setStatusCode(202);
    }

    /** Signed links for logos and outro files (img/video tags can't send the JWT). */
    public function file(Project $project, string $kind): SymfonyResponse
    {
        $column = Project::FILES[$kind] ?? abort(404);
        $path = $project->{$column} ?? abort(404);
        $disk = Storage::disk(config('yumetuli.media_disk'));

        if (config('filesystems.disks.'.config('yumetuli.media_disk').'.driver') === 'local') {
            return response()->file($disk->path($path), ['Cache-Control' => 'private, max-age=600']);
        }

        return redirect()->away($disk->temporaryUrl($path, now()->addMinutes(5)));
    }

    private function rerender(Project $project): void
    {
        $project->update(['outro_status' => 'rendering', 'outro_error' => null]);
        RenderOutroPreviewJob::dispatch($project->id);
    }

    private function replaceFile(Project $project, string $column, string $path): void
    {
        if ($project->{$column}) {
            Storage::disk(config('yumetuli.media_disk'))->delete($project->{$column});
        }
        $project->update([$column => $path]);
    }
}
