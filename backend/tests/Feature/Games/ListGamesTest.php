<?php

use App\Models\Game;
use Laravel\Sanctum\Sanctum;

test('unauthenticated users cannot list games', function () {
    $response = $this->getJson('/api/games');

    $response->assertStatus(401);
});

test('user with role user cannot list games', function () {
    $user = createUser(['role' => 'user']);
    Sanctum::actingAs($user);

    $this->getJson('/api/games')
        ->assertStatus(403)
        ->assertJson(['message' => 'Você não tem permissão para visualizar os jogos.']);
});

test('user with role admin can list games', function () {
    $user = createUser(['role' => 'admin']);
    Game::factory()->count(5)->create();
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/games');

    $response->assertStatus(200);
    $response->assertJsonCount(5, 'data');
});
