<?php

namespace Tests\Feature;

use App\Enums\VideoStatus;
use App\Models\Series;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use RefreshDatabase;

    private Series $series;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
        $this->actingAs(User::factory()->create(), 'api');
        $this->series = Series::factory()->create(['folder' => 'hizibizi']);
    }

    private function voice(string $name = 'voice.mp3'): UploadedFile
    {
        return UploadedFile::fake()->create($name, 500, 'audio/mpeg');
    }

    private function payload(array $overrides = []): array
    {
        return [
            'series_id' => $this->series->id,
            'title' => 'Why is the sky blue',
            'language' => 'bn',
            'context' => 'Kids, 60s',
            'script' => "[Curious] আকাশ নীল কেন?\nআলো ছড়িয়ে পড়ে।",
            'target_seconds' => 60,
            'voice' => $this->voice(),
            ...$overrides,
        ];
    }

    public function test_create_video_with_voice_upload(): void
    {
        $res = $this->post('/api/v1/videos', $this->payload(), ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'hizibizi/why-is-the-sky-blue-bn')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.mode', 'agent')
            ->assertJsonPath('data.voice.kind', 'voice')
            ->assertJsonPath('data.voice.original_name', 'voice.mp3');

        $video = Video::find($res->json('data.id'));
        Storage::disk('media')->assertExists($video->voice->path);
        $this->assertStringStartsWith("videos/{$video->id}/voice-", $video->voice->path);
    }

    public function test_bangla_title_gets_fallback_slug_and_duplicates_are_numbered(): void
    {
        // Bangla is transliterated to ASCII (intl), e.g. "akas-neel-ken".
        $first = $this->post('/api/v1/videos', $this->payload(['title' => 'আকাশ নীল কেন']), ['Accept' => 'application/json'])
            ->assertCreated()->json('data.slug');
        $this->assertMatchesRegularExpression('#^hizibizi/[a-z0-9-]+-bn$#', $first);

        $second = $this->post('/api/v1/videos', $this->payload(['title' => 'আকাশ নীল কেন', 'voice' => $this->voice()]), ['Accept' => 'application/json'])
            ->assertCreated()->json('data.slug');
        $this->assertSame(str_replace('-bn', '-2-bn', $first), $second);

        // Titles with nothing to transliterate fall back to "video".
        $this->post('/api/v1/videos', $this->payload(['title' => '!!!', 'voice' => $this->voice()]), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.slug', 'hizibizi/video-bn');
    }

    public function test_validation(): void
    {
        $this->post('/api/v1/videos', $this->payload([
            'language' => 'fr',
            'voice' => UploadedFile::fake()->create('voice.exe', 10, 'application/octet-stream'),
            'script' => '',
        ]), ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['language', 'voice', 'script']);
    }

    public function test_list_filters_and_show(): void
    {
        Video::factory()->for($this->series)->count(2)->create();
        Video::factory()->for($this->series)->create(['status' => VideoStatus::Ready, 'title' => 'Spoon mirror']);

        $this->getJson('/api/v1/videos?status=ready')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/videos?q=Spoon')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/videos')->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('meta.total', 3);

        $id = Video::where('title', 'Spoon mirror')->value('id');
        $this->getJson("/api/v1/videos/{$id}")->assertOk()->assertJsonPath('data.series.id', $this->series->id);
    }

    public function test_only_drafts_are_editable_and_voice_can_be_replaced(): void
    {
        $id = $this->post('/api/v1/videos', $this->payload(), ['Accept' => 'application/json'])->json('data.id');
        $old = Video::find($id)->voice->path;

        $this->post("/api/v1/videos/{$id}", [
            '_method' => 'PATCH',
            'title' => 'New title',
            'voice' => $this->voice('take2.wav'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.title', 'New title')
            ->assertJsonPath('data.voice.original_name', 'take2.wav');

        Storage::disk('media')->assertMissing($old);
        $this->assertSame(1, Video::find($id)->assets()->count());

        Video::whereKey($id)->update(['status' => VideoStatus::Building]);
        $this->patchJson("/api/v1/videos/{$id}", ['title' => 'x'])->assertStatus(409);
        $this->deleteJson("/api/v1/videos/{$id}")->assertStatus(409);
    }

    public function test_delete_removes_files(): void
    {
        $id = $this->post('/api/v1/videos', $this->payload(), ['Accept' => 'application/json'])->json('data.id');

        $this->deleteJson("/api/v1/videos/{$id}")->assertNoContent();

        $this->assertDatabaseMissing('videos', ['id' => $id]);
        $this->assertDatabaseCount('assets', 0);
        Storage::disk('media')->assertDirectoryEmpty('/');
    }

    public function test_voice_signed_url_works_without_token_and_tampering_fails(): void
    {
        $url = $this->post('/api/v1/videos', $this->payload(), ['Accept' => 'application/json'])->json('data.voice.url');

        $this->app['auth']->forgetGuards();
        $this->withoutToken();

        $this->get($url)->assertOk();
        $this->get($url.'x')->assertForbidden();
    }
}
