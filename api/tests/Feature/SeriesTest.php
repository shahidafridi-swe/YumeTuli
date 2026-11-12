<?php

namespace Tests\Feature;

use App\Models\Series;
use App\Models\User;
use App\Models\Video;
use Database\Seeders\SeriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeriesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(), 'api');
    }

    public function test_seeder_creates_house_series(): void
    {
        $this->seed(SeriesSeeder::class);
        $this->seed(SeriesSeeder::class); // idempotent

        $this->getJson('/api/v1/series')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['slug' => 'devdiary', 'folder' => 'design-patterns', 'outro' => 'devdiary'])
            ->assertJsonFragment(['slug' => 'hizibizi', 'folder' => 'hizibizi', 'outro' => 'hizibizi']);
    }

    public function test_create_update_and_validate(): void
    {
        $id = $this->postJson('/api/v1/series', [
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
            ->assertJsonValidationErrors(['slug', 'folder']);
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
