<?php

namespace Database\Factories;

use App\Models\Series;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Series> */
class SeriesFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'slug' => $slug,
            'name' => fake()->words(3, true),
            'folder' => $slug,
            'logo_path' => null,
            'outro' => null,
            'theme' => [],
            'rules' => null,
        ];
    }
}
