<?php

use App\Models\Game;
use Laravel\Sanctum\Sanctum;

test('unauthenticated users cannot get game details', function () {
    $response = $this->getJson(route('games.show', ['id' => 1]));

    $response->assertStatus(401);
});

test('user with role user cannot get game details', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $response = $this->getJson(route('games.show', ['id' => 1]));

    $response->assertStatus(403);
});

test('user with role admin can get game details', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $game = Game::factory()->create();

    $response = $this->getJson(route('games.show', ['id' => $game->id]));

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $game->id,
                'home_team' => $game->homeTeam->only(['id', 'name', 'abbreviation']),
                'away_team' => $game->awayTeam->only(['id', 'name', 'abbreviation']),
                'home_team_goals' => $game->home_team_goals,
                'away_team_goals' => $game->away_team_goals,
            ],
        ]);
});

test('returns 404 if game not found', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->getJson(route('games.show', ['id' => 9999]));

    $response->assertStatus(404);
});

test('returns 404 for invalid game id', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->getJson(route('games.show', ['id' => 'invalid']));

    $response->assertStatus(404);
});
