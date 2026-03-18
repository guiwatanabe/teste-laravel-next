<?php

use App\Models\Game;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot update a game', function () {
    $response = $this->patchJson(route('games.update', ['id' => 1]), [
        'home_team_goals' => 1,
        'away_team_goals' => 2,
    ]);

    $response->assertStatus(401);
});

test('user with role USER cannot update a game', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $response = $this->patchJson(route('games.update', ['id' => 1]), [
        'home_team_goals' => 1,
        'away_team_goals' => 2,
    ]);

    $response->assertStatus(403);
    $response->assertJson([
        'message' => 'Você não tem permissão para atualizar jogos.',
    ]);
});

test('user with role ADMIN can update a game', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);
    $game = Game::factory()->create(['id' => 1, 'home_team_goals' => 0, 'away_team_goals' => 0, 'status' => 'scheduled']);

    $response = $this->patchJson(route('games.update', ['id' => 1]), [
        'home_team_goals' => 1,
        'away_team_goals' => 2,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => 1,
                'home_team' => $game->homeTeam->only('id', 'name', 'abbreviation'),
                'away_team' => $game->awayTeam->only('id', 'name', 'abbreviation'),
                'home_team_goals' => 1,
                'away_team_goals' => 2,
                'played_at' => $game->played_at->toDateTimeString(),
                'status' => 'finished',
            ],
        ]);

    $this->assertDatabaseHas('games', [
        'id' => 1,
        'home_team_id' => $game->home_team_id,
        'away_team_id' => $game->away_team_id,
        'home_team_goals' => 1,
        'away_team_goals' => 2,
        'status' => 'finished',
    ]);
});

test('cannot update a game with invalid data', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->patchJson(route('games.update', ['id' => 1]), [
        'home_team_goals' => '',
        'away_team_goals' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['home_team_goals', 'away_team_goals']);
});

test('cannot update a non-existing game', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->patchJson(route('games.update', ['id' => 9999]), [
        'home_team_goals' => 1,
        'away_team_goals' => 2,
    ]);

    $response->assertStatus(404);
});
