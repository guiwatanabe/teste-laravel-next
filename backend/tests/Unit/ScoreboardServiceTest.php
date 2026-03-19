<?php

use App\Models\Game;
use App\Models\Team;
use App\Services\ScoreboardService;

test('standings are empty when no teams exist', function () {
    $service = new ScoreboardService;
    $standings = $service->getStandings();
    expect($standings)->toBeArray()->and($standings)->toBeEmpty();
});

test('standings are zeroed when teams exist but no games', function () {
    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);

    $service = new ScoreboardService;
    $standings = $service->getStandings();

    expect($standings[0]['points'])->toBe(0);
    expect($standings[1]['points'])->toBe(0);
    expect($standings[0]['games'])->toBe(0);
    expect($standings[1]['games'])->toBe(0);
});

test('standings handle all draws', function () {
    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);

    Game::factory()->create([
        'home_team_id' => $teamA->id,
        'away_team_id' => $teamB->id,
        'home_team_goals' => 1,
        'away_team_goals' => 1,
        'status' => 'finished',
    ]);
    Game::factory()->create([
        'home_team_id' => $teamB->id,
        'away_team_id' => $teamA->id,
        'home_team_goals' => 2,
        'away_team_goals' => 2,
        'status' => 'finished',
    ]);

    $service = new ScoreboardService;
    $standings = $service->getStandings();

    expect($standings[0]['points'])->toBe(2);
    expect($standings[1]['points'])->toBe(2);
    expect($standings[0]['draws'])->toBe(2);
    expect($standings[1]['draws'])->toBe(2);
});

test('standings handle tiebreakers by goal difference', function () {
    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);

    Game::factory()->create([
        'home_team_id' => $teamA->id,
        'away_team_id' => $teamB->id,
        'home_team_goals' => 3,
        'away_team_goals' => 0,
        'status' => 'finished',
    ]);
    Game::factory()->create([
        'home_team_id' => $teamB->id,
        'away_team_id' => $teamA->id,
        'home_team_goals' => 2,
        'away_team_goals' => 5,
        'status' => 'finished',
    ]);

    $service = new ScoreboardService;
    $standings = $service->getStandings();

    expect($standings[0]['team_name'])->toBe('Team A');
    expect($standings[0]['goal_difference'])->toBe(6);
    expect($standings[1]['goal_difference'])->toBe(-6);
});

test('standings handle tiebreakers by goals for', function () {
    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);

    Game::factory()->create([
        'home_team_id' => $teamA->id,
        'away_team_id' => $teamB->id,
        'home_team_goals' => 4,
        'away_team_goals' => 2,
        'status' => 'finished',
    ]);
    Game::factory()->create([
        'home_team_id' => $teamB->id,
        'away_team_id' => $teamA->id,
        'home_team_goals' => 3,
        'away_team_goals' => 1,
        'status' => 'finished',
    ]);

    $service = new ScoreboardService;
    $standings = $service->getStandings();

    expect($standings[0]['team_name'])->toBe('Team A');
    expect($standings[1]['team_name'])->toBe('Team B');
    expect($standings[0]['points'])->toBe(3);
    expect($standings[1]['points'])->toBe(3);
    expect($standings[0]['goal_difference'])->toBe(0);
    expect($standings[1]['goal_difference'])->toBe(0);
    expect($standings[0]['goals_for'])->toBe(5);
    expect($standings[1]['goals_for'])->toBe(5);
});

test('scoreboard is calculated correctly', function () {
    $teamA = Team::factory()->create(['name' => 'Team A']);
    $teamB = Team::factory()->create(['name' => 'Team B']);

    Game::factory()->create([
        'home_team_id' => $teamA->id,
        'away_team_id' => $teamB->id,
        'home_team_goals' => 2,
        'away_team_goals' => 1,
        'status' => 'finished',
    ]);
    Game::factory()->create([
        'home_team_id' => $teamB->id,
        'away_team_id' => $teamA->id,
        'home_team_goals' => 0,
        'away_team_goals' => 0,
        'status' => 'finished',
    ]);

    $service = new ScoreboardService;
    $standings = $service->getStandings();

    $this->assertEquals(4, $standings[0]['points']);
    $this->assertEquals(1, $standings[1]['points']);
    $this->assertEquals('Team A', $standings[0]['team_name']);
    $this->assertEquals('Team B', $standings[1]['team_name']);
});
