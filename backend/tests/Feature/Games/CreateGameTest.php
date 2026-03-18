<?php

use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot create a game', function () {
    $response = $this->postJson(route('games.store'), [
        'home_team_id' => 1,
        'away_team_id' => 2,
        'home_team_goals' => 0,
        'away_team_goals' => 0,
    ]);

    $response->assertStatus(401);
});

test('user with role USER cannot create a game', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $response = $this->postJson(route('games.store'), [
        'home_team_id' => 1,
        'away_team_id' => 2,
        'played_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertStatus(403);
    $response->assertJson([
        'status' => 'error',
        'message' => 'Você não tem permissão para criar jogos.',
    ]);
});

test('user with role ADMIN can create a game', function () {
    $admin = createUser(['role' => 'admin']);
    $homeTeam = Team::factory()->create(['id' => 1, 'name' => 'Team A', 'abbreviation' => 'TMA']);
    $awayTeam = Team::factory()->create(['id' => 2, 'name' => 'Team B', 'abbreviation' => 'TMB']);
    Sanctum::actingAs($admin);

    $response = $this->postJson(route('games.store'), [
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'played_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'id' => 1,
            'home_team' => $homeTeam->only(['id', 'name', 'abbreviation']),
            'away_team' => $awayTeam->only(['id', 'name', 'abbreviation']),
            'played_at' => now()->addDay()->toDateTimeString(),
        ]);

    $this->assertDatabaseHas('games', [
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'played_at' => now()->addDay()->toDateTimeString(),
    ]);
});

test('cannot create a game with invalid data', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->postJson(route('games.store'), [
        'home_team_id' => 1,
        'away_team_id' => 2,
        'played_at' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['home_team_id', 'away_team_id', 'played_at']);
});

test('cannot create a game with same team as opponent', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->postJson(route('games.store'), [
        'home_team_id' => 1,
        'away_team_id' => 1,
        'played_at' => now()->addDay()->toDateTimeString(),
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['away_team_id']);
});
