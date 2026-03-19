<?php

test('scoreboard returns correct structure', function () {
    $this->seed();

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
