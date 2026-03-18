<?php

use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot update a team', function () {
    $response = $this->patchJson(route('teams.update', ['id' => 1]), [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(401);
});

test('user with role USER cannot update a team', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);
    Team::factory()->create(['id' => 1, 'name' => 'Team A', 'abbreviation' => 'TMA']);

    $response = $this->patchJson(route('teams.update', ['id' => 1]), [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(403);
    $response->assertJson([
        'message' => 'Você não tem permissão para editar um time.',
    ]);
});

test('user with role ADMIN can update a team', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);
    Team::factory()->create(['id' => 1, 'name' => 'Old Team', 'abbreviation' => 'OLD']);

    $response = $this->patchJson(route('teams.update', ['id' => 1]), [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => 1,
                'name' => 'Team A',
                'abbreviation' => 'TMA',
            ],
        ]);

    $this->assertDatabaseHas('teams', [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);
});

test('cannot update a team with invalid data', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->patchJson(route('teams.update', ['id' => 1]), [
        'name' => '',
        'abbreviation' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'abbreviation']);
});

test('cannot update a non-existing team', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->patchJson(route('teams.update', ['id' => 9999]), [
        'name' => 'Team A',
        'abbreviation' => 'TMA',
    ]);

    $response->assertStatus(404);
});
