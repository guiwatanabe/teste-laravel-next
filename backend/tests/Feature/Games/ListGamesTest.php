<?php

use App\Models\Game;
use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated users cannot list games', function () {
    $response = $this->getJson(route('games.index'));

    $response->assertStatus(401);
});

test('user with role user cannot list games', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $this->getJson(route('games.index'))
        ->assertStatus(403)
        ->assertJson(['message' => 'Você não tem permissão para visualizar os jogos.']);
});

test('user with role admin can list games', function () {
    $user = createUser(['role' => 'admin']);
    Game::factory()->count(5)->create();
    Sanctum::actingAs($user);

    $response = $this->getJson(route('games.index'));

    $response->assertStatus(200);
    $response->assertJsonCount(5, 'data');
});

test('results get filtered by team name', function () {
    $user = createUser(['role' => 'admin']);
    Sanctum::actingAs($user);

    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);
    $teamC = Team::factory()->create(['name' => 'Team C']);
    Game::factory()->create(['home_team_id' => $teamA->id, 'away_team_id' => $teamB->id]);
    Game::factory()->create(['home_team_id' => $teamB->id, 'away_team_id' => $teamA->id]);
    Game::factory()->create(['home_team_id' => $teamC->id, 'away_team_id' => $teamB->id]);

    $response = $this->getJson(route('games.index', ['team_name' => 'Team A']));

    $response->assertStatus(200);
    $response->assertJsonCount(2, 'data');
});

test('results get filtered by played_at date range', function () {
    $user = createUser(['role' => 'admin']);
    Sanctum::actingAs($user);

    Game::factory()->create(['played_at' => '2024-01-01']);
    Game::factory()->create(['played_at' => '2024-02-01']);
    Game::factory()->create(['played_at' => '2024-03-01']);

    $response = $this->getJson(route('games.index', [
        'played_at_from' => '2024-01-15',
        'played_at_to' => '2024-02-15',
    ]));

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
});

test('results get paginated', function () {
    $user = createUser(['role' => 'admin']);
    Sanctum::actingAs($user);

    Game::factory()->count(15)->create();

    $response = $this->getJson('/api/games?page=1');
    $response->assertOk();
    $response->assertJsonPath('meta.per_page', 10);
    $response->assertJsonPath('meta.current_page', 1);
    $response->assertJsonCount(10, 'data');

    $response = $this->getJson('/api/games?page=2');
    $response->assertOk();
    $response->assertJsonPath('meta.current_page', 2);
    $response->assertJsonCount(5, 'data');
});
