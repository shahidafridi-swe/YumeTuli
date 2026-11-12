<?php

namespace Tests\Feature;

use App\Enums\RunStatus;
use App\Enums\VideoStatus;
use App\Jobs\RunVideoJob;
use App\Models\Run;
use App\Models\Series;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Full plan → approve → feedback cycle against tests/Fixtures/fake-claude (sync queue). */
class VideoRunTest extends TestCase
{
    use RefreshDatabase;

    private string $engine;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
        $this->engine = storage_path('framework/testing/engine-'.uniqid());
        File::ensureDirectoryExists($this->engine);
        config([
            'yumetuli.engine_path' => $this->engine,
            'yumetuli.claude.bin' => base_path('tests/Fixtures/fake-claude'),
        ]);
        $this->actingAs(User::factory()->create(), 'api');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->engine);
        parent::tearDown();
    }

    private function video(string $context = 'Kids, 60s'): Video
    {
        $series = Series::factory()->create(['folder' => 'hizibizi', 'outro' => 'hizibizi', 'rules' => 'Full-screen.']);
        $id = $this->post('/api/v1/videos', [
            'series_id' => $series->id,
            'title' => 'Rainbow',
            'language' => 'bn',
            'context' => $context,
            'script' => '[Curious] রংধনু কেন হয়?',
            'voice' => UploadedFile::fake()->create('voice.mp3', 200, 'audio/mpeg'),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        return Video::findOrFail($id);
    }

    public function test_plan_approve_feedback_ready_cycle(): void
    {
        $video = $this->video();

        // Plan
        $this->postJson("/api/v1/videos/{$video->id}/plan")->assertStatus(202)->assertJsonPath('data.kind', 'plan');
        $video->refresh();
        $this->assertSame(VideoStatus::AwaitingApproval, $video->status);
        $this->assertStringContainsString('## Scene 1', $video->plan);
        $this->assertSame('fake-session-1', $video->claude_session_id);
        $this->assertFileExists("{$this->engine}/inbox/{$video->id}/voice.mp3");
        $this->assertStringContainsString('রংধনু', file_get_contents("{$this->engine}/inbox/{$video->id}/script.md"));
        $planArgs = file_get_contents("{$this->engine}/inbox/{$video->id}/args-plan.txt");
        $this->assertStringContainsString('stream-json', $planArgs);
        $this->assertStringNotContainsString('--resume', $planArgs);
        $this->assertStringContainsString('Bash(npm run *)', $planArgs);
        $this->assertStringContainsString('--append-system-prompt', $planArgs);
        $this->assertStringContainsString('"format": "vertical"', $planArgs);
        $this->assertStringContainsString('Format: vertical 9:16', file_get_contents("{$this->engine}/inbox/{$video->id}/brief.md"));

        // Claude never sees the worker's secrets.
        $env = file("{$this->engine}/inbox/{$video->id}/env-plan.txt", FILE_IGNORE_NEW_LINES);
        $this->assertContains('PATH', $env);
        foreach (['DB_PASSWORD', 'JWT_SECRET', 'APP_KEY', 'REVERB_APP_SECRET'] as $secret) {
            $this->assertNotContains($secret, $env);
        }

        // Approve with an edited plan → build resumes the session and imports version 1
        $this->postJson("/api/v1/videos/{$video->id}/approve", ['plan' => "# Plan\nEdited by owner"])->assertStatus(202);
        $video->refresh();
        $this->assertSame(VideoStatus::Review, $video->status);
        $this->assertSame("# Plan\nEdited by owner", file_get_contents("{$this->engine}/inbox/{$video->id}/plan.md"));
        $this->assertStringContainsString("--resume\nfake-session-1", file_get_contents("{$this->engine}/inbox/{$video->id}/args-build.txt"));

        $show = $this->getJson("/api/v1/videos/{$video->id}")->assertOk()
            ->assertJsonPath('data.status', 'review')
            ->assertJsonPath('data.current_version.number', 1)
            ->assertJsonPath('data.current_version.duration_sec', 61.5)
            ->assertJsonCount(3, 'data.current_version.assets');
        $mp4 = collect($show->json('data.current_version.assets'))->firstWhere('kind', 'mp4');
        Storage::disk('media')->assertExists("videos/{$video->id}/v1/rainbow-bn-v1.mp4");
        $this->get($mp4['url'])->assertOk();

        // Run log has friendly steps
        $run = Run::where('kind', 'build')->firstOrFail();
        $this->assertSame(RunStatus::Succeeded, $run->status);
        $this->assertSame(3, $run->num_turns);
        $steps = collect($this->getJson("/api/v1/runs/{$run->id}/events")->assertOk()->json('data'))->pluck('step')->filter()->unique()->values()->all();
        $this->assertContains('Rendering', $steps);
        $this->assertContains('Checking frames', $steps);
        $this->assertSame(0, count($this->getJson("/api/v1/runs/{$run->id}/events?after=999999")->json('data')));

        // Feedback → version 2
        $this->postJson("/api/v1/videos/{$video->id}/feedback", ['feedback' => 'Move the rainbow lower'])->assertStatus(202);
        $video->refresh();
        $this->assertSame(VideoStatus::Review, $video->status, (string) $video->runs()->first()->error);
        $this->assertSame(2, $video->currentVersion->number);
        $this->assertSame('Move the rainbow lower', $video->currentVersion->feedback);
        $this->assertStringContainsString('Move the rainbow lower', file_get_contents("{$this->engine}/inbox/{$video->id}/args-feedback.txt"));

        // Ready, and feedback still possible afterwards
        $this->postJson("/api/v1/videos/{$video->id}/ready")->assertOk()->assertJsonPath('data.status', 'ready');
        $this->postJson("/api/v1/videos/{$video->id}/feedback", ['feedback' => 'Louder'])->assertStatus(202);
        $this->assertSame(3, $video->fresh()->currentVersion->number);
        $this->getJson("/api/v1/videos/{$video->id}/runs")->assertOk()->assertJsonCount(4, 'data');
    }

    public function test_invalid_transitions_are_rejected(): void
    {
        $video = $this->video();

        $this->postJson("/api/v1/videos/{$video->id}/approve")->assertStatus(409);
        $this->postJson("/api/v1/videos/{$video->id}/feedback", ['feedback' => 'x'])->assertStatus(409);
        $this->postJson("/api/v1/videos/{$video->id}/ready")->assertStatus(409);
        $this->postJson("/api/v1/videos/{$video->id}/retry")->assertStatus(409);
        $this->postJson("/api/v1/videos/{$video->id}/cancel")->assertStatus(409);
        $this->postJson("/api/v1/videos/{$video->id}/feedback", [])->assertUnprocessable();
    }

    public function test_failure_then_retry(): void
    {
        $video = $this->video('FAIL_ONCE');

        $this->postJson("/api/v1/videos/{$video->id}/plan")->assertStatus(202);
        $video->refresh();
        $this->assertSame(VideoStatus::Failed, $video->status);
        $this->assertStringContainsString('Something broke', $video->runs()->first()->error);

        $this->postJson("/api/v1/videos/{$video->id}/retry")->assertStatus(202)->assertJsonPath('data.kind', 'plan');
        $this->assertSame(VideoStatus::AwaitingApproval, $video->fresh()->status);
    }

    public function test_usage_limit_gets_a_friendly_message(): void
    {
        $video = $this->video('LIMIT');
        $this->postJson("/api/v1/videos/{$video->id}/plan");

        $this->assertSame(__('api.run_usage_limit'), $video->runs()->first()->error);
    }

    public function test_build_without_result_line_fails(): void
    {
        $video = $this->video('NO_RESULT');
        $this->postJson("/api/v1/videos/{$video->id}/plan");
        $this->postJson("/api/v1/videos/{$video->id}/approve");

        $this->assertSame(VideoStatus::Failed, $video->fresh()->status);
        $this->assertSame(__('api.run_no_result'), $video->runs()->first()->error);
    }

    public function test_result_paths_outside_the_engine_are_refused(): void
    {
        $video = $this->video('ESCAPE');
        $this->postJson("/api/v1/videos/{$video->id}/plan");
        $this->postJson("/api/v1/videos/{$video->id}/approve");

        $this->assertSame(VideoStatus::Failed, $video->fresh()->status);
        $this->assertStringContainsString('not found in the engine', $video->runs()->first()->error);
        $this->assertSame(0, $video->versions()->count());
    }

    public function test_cancel_a_queued_run(): void
    {
        Queue::fake();
        $video = $this->video();

        $this->postJson("/api/v1/videos/{$video->id}/plan")->assertStatus(202);
        Queue::assertPushed(RunVideoJob::class);
        $this->assertSame(VideoStatus::Queued, $video->fresh()->status);
        $this->postJson("/api/v1/videos/{$video->id}/plan")->assertStatus(409); // one run at a time
        $this->deleteJson("/api/v1/videos/{$video->id}")->assertStatus(409);

        $this->postJson("/api/v1/videos/{$video->id}/cancel")->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->assertSame(VideoStatus::Draft, $video->fresh()->status);
    }
}
