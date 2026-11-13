<?php

namespace Tests\Feature;

use App\Jobs\GenerateCustomOutroJob;
use App\Jobs\RenderOutroPreviewJob;
use App\Models\Project;
use App\Models\Series;
use App\Models\User;
use App\Services\Runs\ProjectBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
        Queue::fake();
        $this->actingAs(User::factory()->create(), 'api');
    }

    private function png(int $w = 400, int $h = 100): UploadedFile
    {
        return UploadedFile::fake()->image('logo.png', $w, $h);
    }

    public function test_create_show_and_list_projects(): void
    {
        $id = $this->postJson('/api/v1/projects', ['name' => 'Space Kids', 'slug' => 'space-kids'])
            ->assertCreated()
            ->assertJsonPath('data.outro.mode', 'none')
            ->json('data.id');
        Series::factory()->for(Project::find($id))->create(['name' => 'Planets']);

        $this->getJson("/api/v1/projects/{$id}")->assertOk()->assertJsonPath('data.series.0.name', 'Planets')->assertJsonPath('data.series_count', 1);
        $this->getJson('/api/v1/projects')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/v1/projects', ['name' => 'x', 'slug' => 'Bad Slug'])->assertUnprocessable();
    }

    public function test_logo_upload_sets_ratio_and_signed_url_serves_it(): void
    {
        $project = Project::factory()->create(['outro_mode' => 'common']);

        $res = $this->post("/api/v1/projects/{$project->id}/logo", ['logo' => $this->png(400, 100)], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.logo_ratio', 4);
        Queue::assertPushed(RenderOutroPreviewJob::class); // common outro uses the logo → new preview

        $this->post("/api/v1/projects/{$project->id}/logo", ['logo' => $this->png(), 'variant' => 'alt'], ['Accept' => 'application/json'])
            ->assertOk();
        $this->assertNotNull($project->fresh()->logo_alt_path);
        $this->post("/api/v1/projects/{$project->id}/logo", ['logo' => UploadedFile::fake()->create('x.exe', 10)], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        // Signed link works without a token; a tampered one does not.
        $this->app['auth']->forgetGuards();
        $this->get($res->json('data.logo_url'))->assertOk();
        $this->get($res->json('data.logo_url').'x')->assertForbidden();
    }

    public function test_outro_modes_need_their_inputs(): void
    {
        $project = Project::factory()->create();

        $this->patchJson("/api/v1/projects/{$project->id}", ['outro_mode' => 'common'])->assertStatus(409);
        $this->patchJson("/api/v1/projects/{$project->id}", ['outro_mode' => 'video'])->assertStatus(409);
        $this->patchJson("/api/v1/projects/{$project->id}", ['outro_mode' => 'custom'])->assertStatus(409);
        $this->postJson("/api/v1/projects/{$project->id}/outro/custom", ['brief' => 'x'])->assertStatus(409);

        $this->post("/api/v1/projects/{$project->id}/logo", ['logo' => $this->png()], ['Accept' => 'application/json'])->assertOk();
        $this->patchJson("/api/v1/projects/{$project->id}", ['outro_mode' => 'common'])
            ->assertOk()
            ->assertJsonPath('data.outro.mode', 'common')
            ->assertJsonPath('data.outro.status', 'rendering');
        Queue::assertPushed(RenderOutroPreviewJob::class);
    }

    public function test_upload_outro_video_and_ask_for_custom_outro(): void
    {
        $project = Project::factory()->create();
        $this->post("/api/v1/projects/{$project->id}/outro/video", [
            'video' => UploadedFile::fake()->create('outro.mp4', 500, 'video/mp4'),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.outro.mode', 'video');
        Queue::assertPushed(RenderOutroPreviewJob::class);

        $project->update(['outro_status' => 'idle']);
        $this->post("/api/v1/projects/{$project->id}/logo", ['logo' => $this->png()], ['Accept' => 'application/json']);
        $this->postJson("/api/v1/projects/{$project->id}/outro/custom", ['brief' => 'Letters fall in like rain'])
            ->assertStatus(202)
            ->assertJsonPath('data.outro.status', 'generating')
            ->assertJsonPath('data.outro.brief', 'Letters fall in like rain');
        Queue::assertPushed(GenerateCustomOutroJob::class);
        $this->postJson("/api/v1/projects/{$project->id}/outro/custom")->assertStatus(409); // already busy
    }

    public function test_project_with_series_cannot_be_deleted(): void
    {
        $project = Project::factory()->create();
        Series::factory()->for($project)->create();
        $this->deleteJson("/api/v1/projects/{$project->id}")->assertStatus(409);

        $empty = Project::factory()->create();
        $this->deleteJson("/api/v1/projects/{$empty->id}")->assertNoContent();
    }

    public function test_brand_sync_copies_files_into_the_engine_and_describes_the_outro(): void
    {
        $engine = storage_path('framework/testing/engine-'.uniqid());
        File::ensureDirectoryExists($engine);
        $project = Project::factory()->create(['slug' => 'space-kids', 'outro_mode' => 'common', 'logo_ratio' => 4]);
        Storage::disk('media')->put('projects/1/logo-a.png', 'png-bytes');
        $project->update(['logo_path' => 'projects/1/logo-a.png']);

        $synced = (new ProjectBrand($engine))->sync($project);

        $this->assertSame('brand/projects/space-kids/logo.png', $synced['logo']);
        $this->assertFileExists("{$engine}/public/brand/projects/space-kids/logo.png");
        $this->assertSame(['outro' => 'common', 'outro_logo' => 'brand/projects/space-kids/logo.png', 'outro_logo_ratio' => 4.0], $synced['outro']);

        $project->update(['outro_mode' => 'custom', 'outro_key' => 'p-space-kids']);
        $this->assertSame(['outro' => 'p-space-kids'], (new ProjectBrand($engine))->sync($project)['outro']);
        File::deleteDirectory($engine);
    }
}
