<?php

use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot create a team', function () {
    $response = $this->postJson('/api/teams', [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(401);
});

test('user with role USER cannot create a team', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/teams', [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(403);
});

test('user with role ADMIN can create a team', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/teams', [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'Team A',
                'abbreviation' => 'TMA',
            ],
        ]);

    $this->assertDatabaseHas('teams', [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);
});

test('cannot create a team with invalid data', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/teams', [
        'name' => '',
        'abbreviation' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'abbreviation']);
});
