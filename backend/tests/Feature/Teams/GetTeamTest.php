<?php

use App\Models\Game;
use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot get team details', function () {
    $this->getJson(route('teams.show', ['id' => 1]))->assertUnauthorized();
});

test('user with role user cannot get team details', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $this->getJson(route('teams.show', ['id' => 1]))->assertForbidden();
});

test('user with role admin can get team details', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $team = Team::factory()->create();

    $this->getJson(route('teams.show', ['id' => $team->id]))
        ->assertOk()
        ->assertJson([
            'data' => [
                'id' => $team->id,
                'name' => $team->name,
                'abbreviation' => $team->abbreviation,
            ],
        ]);
});

test('returns 404 if team not found', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $this->getJson(route('teams.show', ['id' => 9999]))->assertNotFound();
});

test('returns 404 for invalid team id', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $this->getJson(route('teams.show', ['id' => 'invalid']))->assertNotFound();
});

test('get team details return games count', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $team = Team::factory()->create();
    $homeGames = Game::factory()->count(2)->create(['home_team_id' => $team->id]);
    $awayGames = Game::factory()->count(3)->create(['away_team_id' => $team->id]);

    $response = $this->getJson(route('teams.show', ['id' => $team->id]))->assertOk();

    $response->assertJsonFragment([
        'id' => $team->id,
        'name' => $team->name,
        'abbreviation' => $team->abbreviation,
        'games_count' => count($homeGames) + count($awayGames),
    ]);
});
