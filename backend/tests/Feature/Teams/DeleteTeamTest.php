<?php

use App\Models\Team;
use Laravel\Sanctum\Sanctum;

test('unauthenticated user cannot delete a team', function () {
    $response = $this->deleteJson('/api/teams/1');

    $response->assertStatus(401);
});

test('user with role USER cannot delete a team', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);
    Team::factory()->create(['id' => 1, 'name' => 'Team A', 'abbreviation' => 'TMA']);

    $response = $this->deleteJson('/api/teams/1');

    $response->assertStatus(403);
    $response->assertJson([
        'message' => 'Você não tem permissão para deletar um time.',
    ]);
});

test('user with role ADMIN can delete a team', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);
    Team::factory()->create(['id' => 1, 'name' => 'Old Team', 'abbreviation' => 'OLD']);

    $response = $this->deleteJson('/api/teams/1');

    $response->assertStatus(204);
    $this->assertDatabaseMissing('teams', [
        'id' => 1,
    ]);
});

test('cannot delete a non-existing team', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->deleteJson('/api/teams/9999');

    $response->assertStatus(404);
});
