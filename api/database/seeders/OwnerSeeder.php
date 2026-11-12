<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/** Creates or updates the single owner account from OWNER_* in .env. */
class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        $owner = config('yumetuli.owner');

        if (blank($owner['email']) || blank($owner['password'])) {
            $this->command?->warn('OWNER_EMAIL / OWNER_PASSWORD not set — owner account skipped.');

            return;
        }

        User::updateOrCreate(
            ['email' => $owner['email']],
            ['name' => $owner['name'], 'password' => $owner['password']],
        );

        $this->command?->info("Owner account ready: {$owner['email']}");
    }
}
