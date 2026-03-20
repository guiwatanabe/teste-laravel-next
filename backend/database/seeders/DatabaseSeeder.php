<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (User::where('role', 'admin')->count() === 0) {
            $this->createAdminUser();
        }

        if (User::where('role', 'user')->count() === 0) {
            $this->createUser();
        }

        $this->call([
            TeamSeeder::class,
            GameSeeder::class,
        ]);
    }

    private function createAdminUser(): void
    {
        User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
    }

    private function createUser(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'role' => 'user',
        ]);
    }
}
