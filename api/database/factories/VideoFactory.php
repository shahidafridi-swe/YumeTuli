<?php

namespace Database\Factories;

use App\Enums\VideoStatus;
use App\Models\Series;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Video> */
class VideoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'series_id' => Series::factory(),
            'title' => fake()->sentence(3),
            'slug' => 'test/'.fake()->unique()->slug(3).'-bn',
            'language' => 'bn',
            'context' => fake()->sentence(),
            'script' => fake()->paragraph(),
            'target_seconds' => 60,
            'mode' => 'agent',
            'status' => VideoStatus::Draft,
        ];
    }
}
