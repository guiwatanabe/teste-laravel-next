<?php

use App\Models\Game;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot delete a game', function () {
    $response = $this->deleteJson(route('games.destroy', ['id' => 1]));

    $response->assertStatus(401);
});

test('user with role USER cannot delete a game', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);
    Game::factory()->create(['id' => 1, 'home_team_goals' => 2, 'away_team_goals' => 1, 'status' => 'finished']);

    $response = $this->deleteJson(route('games.destroy', ['id' => 1]));

    $response->assertStatus(403);
    $response->assertJson([
        'message' => 'Você não tem permissão para deletar jogos.',
    ]);
});

test('user with role ADMIN can delete a game', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);
    Game::factory()->create([
        'id' => 1,
        'home_team_goals' => 2,
        'away_team_goals' => 1,
        'status' => 'finished',
        'played_at' => now()->subDay(1),
    ]);

    $response = $this->deleteJson(route('games.destroy', ['id' => 1]));

    $response->assertStatus(204);
    $this->assertDatabaseMissing('games', [
        'id' => 1,
    ]);
});

test('cannot delete a game that has happened more than 3 days ago', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);
    Game::factory()->create([
        'id' => 1,
        'home_team_goals' => 2,
        'away_team_goals' => 1,
        'status' => 'finished',
        'played_at' => now()->subDays(4),
    ]);

    $response = $this->deleteJson(route('games.destroy', ['id' => 1]));

    $response->assertStatus(400);
    $this->assertDatabaseHas('games', [
        'id' => 1,
    ]);
});

test('cannot delete a non-existing game', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->deleteJson(route('games.destroy', ['id' => 9999]));

    $response->assertStatus(404);
});

test('cannot delete a game that is not finished', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    Game::factory()->create([
        'status' => 'scheduled',
        'played_at' => now()->addDay(1),
    ]);

    $response = $this->deleteJson(route('games.destroy', ['id' => 1]));

    $response->assertStatus(400);
    $this->assertDatabaseHas('games', [
        'id' => 1,
    ]);
});
