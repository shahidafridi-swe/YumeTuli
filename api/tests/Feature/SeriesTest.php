<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Series;
use App\Models\User;
use App\Models\Video;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeriesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media'); // the seeder imports logos
        $this->actingAs(User::factory()->create(), 'api');
    }

    public function test_seeder_creates_house_projects_and_series(): void
    {
        $this->seed(ProjectSeeder::class);
        $this->seed(ProjectSeeder::class); // idempotent

        $this->getJson('/api/v1/projects')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['slug' => 'devdiary', 'name' => 'Dev Diary by Afridi'])
            ->assertJsonFragment(['slug' => 'hizibizi', 'name' => 'hizibizi']);

        $series = $this->getJson('/api/v1/series')->assertOk()->assertJsonCount(2, 'data')->json('data');
        $bySlug = collect($series)->keyBy('slug');
        $this->assertSame('design-patterns', $bySlug['design-patterns']['folder']);
        $this->assertSame('devdiary', $bySlug['design-patterns']['project']['slug']);
        $this->assertSame('hizibizi', $bySlug['why-is-that']['project']['slug']);
        $this->assertSame('custom', $bySlug['why-is-that']['project']['outro']['mode']);
    }

    public function test_seeder_renames_old_series_slugs(): void
    {
        $old = Series::factory()->create(['slug' => 'hizibizi', 'folder' => 'hizibizi']);
        $this->seed(ProjectSeeder::class);

        $this->assertSame('why-is-that', $old->fresh()->slug);
        $this->assertSame(2, Series::count());
    }

    public function test_create_update_and_validate(): void
    {
        $id = $this->postJson('/api/v1/series', [
            'project_id' => Project::factory()->create()->id,
            'slug' => 'space-facts',
            'name' => 'Space Facts',
            'folder' => 'space',
            'theme' => ['caption_style' => 'shadow'],
        ])->assertCreated()->json('data.id');

        $this->patchJson("/api/v1/series/{$id}", ['name' => 'Space!'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Space!');

        $this->postJson('/api/v1/series', ['slug' => 'Bad Slug', 'name' => 'x', 'folder' => '../etc'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['slug', 'folder', 'project_id']);
    }

    public function test_series_with_videos_cannot_be_deleted(): void
    {
        $series = Series::factory()->create();
        Video::factory()->for($series)->create();

        $this->deleteJson("/api/v1/series/{$series->id}")->assertStatus(409);

        $empty = Series::factory()->create();
        $this->deleteJson("/api/v1/series/{$empty->id}")->assertNoContent();
    }
}
