<?php

use App\Models\Game;
use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot list teams', function () {
    $this->getJson(route('teams.index'))->assertUnauthorized();
});

test('user with role user cannot list teams', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $this->getJson(route('teams.index'))->assertForbidden();
});

test('user with role admin can list teams', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    Team::factory()->count(3)->create();

    $this->getJson(route('teams.index'))
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('list teams return games count', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $team = Team::factory()->create();
    $homeGames = Game::factory()->count(2)->create(['home_team_id' => $team->id]);
    $awayGames = Game::factory()->count(3)->create(['away_team_id' => $team->id]);

    $response = $this->getJson(route('teams.index'))->assertOk();

    $response->assertJsonFragment([
        'id' => $team->id,
        'name' => $team->name,
        'abbreviation' => $team->abbreviation,
        'games_count' => count($homeGames) + count($awayGames),
    ]);
});
