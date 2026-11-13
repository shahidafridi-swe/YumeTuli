<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Series;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Series> */
class SeriesFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'project_id' => Project::factory(),
            'slug' => $slug,
            'name' => fake()->words(3, true),
            'folder' => $slug,
            'theme' => [],
            'rules' => null,
        ];
    }
}
