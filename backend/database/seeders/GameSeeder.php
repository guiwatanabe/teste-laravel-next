<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Team;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teamIds = Team::pluck('id');

        for ($i = 0; $i < 20; $i++) {
            $shuffled = $teamIds->shuffle();
            Game::factory()->create([
                'home_team_id' => $shuffled[0],
                'away_team_id' => $shuffled[1],
            ]);
        }
    }
}
