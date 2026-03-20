<?php

use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot access scoreboard', function () {
    $response = $this->getJson(route('scoreboard.index'));

    $response->assertStatus(401);
});

test('scoreboard returns correct structure', function () {
    $this->seed();

    $user = createUser();
    Sanctum::actingAs($user);

    $response = $this->getJson(route('scoreboard.index'));

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => [
                '*' => [
                    'team_id',
                    'team_name',
                    'points',
                    'games',
                    'wins',
                    'draws',
                    'losses',
                    'goals_for',
                    'goals_against',
                    'goal_difference',
                ],
            ],
        ]);
});
