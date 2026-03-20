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
        if (Game::count() > 0) {
            return;
        }

        $teamIds = Team::pluck('id');

        for ($i = 0; $i < 20; $i++) {
            $shuffled = $teamIds->shuffle();
            $inPast = fake()->boolean(60); // 60-40
            $playedAt = $inPast
                ? fake()->dateTimeBetween('-6 months', '-1 day')
                : fake()->dateTimeBetween('+1 day', '+3 months');

            Game::factory()->create([
                'home_team_id' => $shuffled[0],
                'away_team_id' => $shuffled[1],
                'played_at' => $playedAt,
                'status' => $inPast ? 'finished' : 'scheduled',
                'home_team_goals' => $inPast ? fake()->numberBetween(0, 5) : 0,
                'away_team_goals' => $inPast ? fake()->numberBetween(0, 5) : 0,
            ]);
        }
    }
}
