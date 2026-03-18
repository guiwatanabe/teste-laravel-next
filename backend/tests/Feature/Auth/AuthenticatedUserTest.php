<?php

use Laravel\Sanctum\Sanctum;

test('authenticated user can retrieve their details', function () {
    $user = createUser();

    Sanctum::actingAs($user, ['api-access']);

    $response = $this->getJson(route('user'));

    $response->assertStatus(200);
    $response->assertJsonStructure(['status', 'message', 'data' => ['user' => ['id', 'name', 'email']]]);
    $response->assertJsonPath('data.user.id', $user->id);
    $response->assertJsonPath('data.user.name', $user->name);
    $response->assertJsonPath('data.user.email', $user->email);
});

test('unauthenticated user cannot retrieve their details', function () {
    $response = $this->getJson(route('user'));

    $response->assertStatus(401);
});
