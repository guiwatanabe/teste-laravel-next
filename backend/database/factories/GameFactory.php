<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Game>
 */
class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateTime = Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now'));

        return [
            'home_team_id' => Team::factory(),
            'away_team_id' => Team::factory(),
            'home_team_goals' => $this->faker->numberBetween(0, 5),
            'away_team_goals' => $this->faker->numberBetween(0, 5),
            'played_at' => $dateTime,
            'status' => $dateTime->isPast() ? 'finished' : 'scheduled',
        ];
    }
}
