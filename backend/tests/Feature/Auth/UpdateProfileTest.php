<?php

use Laravel\Sanctum\Sanctum;

test('user can update profile with valid input', function () {
    $user = createUser(['name' => 'Original Name', 'email' => 'original@example.com']);

    Sanctum::actingAs($user, ['api-access']);

    $response = $this->postJson(route('profile.update'), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['status', 'message', 'data' => ['user' => ['id', 'name', 'email']]]);
    $response->assertJsonPath('data.user.name', 'Updated Name');
    $response->assertJsonPath('data.user.email', 'updated@example.com');
});

test('user cannot update profile with invalid input', function () {
    $user = createUser(['name' => 'Original Name', 'email' => 'original@example.com']);

    Sanctum::actingAs($user, ['api-access']);

    $response = $this->postJson(route('profile.update'), [
        'name' => '',
        'email' => 'invalid-email',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors']);
});

test('user cannot update profile with existing email', function () {
    $user1 = createUser(['email' => 'existing@example.com']);
    $user2 = createUser(['email' => 'original@example.com']);

    Sanctum::actingAs($user2, ['api-access']);

    $response = $this->postJson(route('profile.update'), [
        'name' => 'Updated Name',
        'email' => 'existing@example.com',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors']);
});

test('user can only update password providing current password', function () {
    $user = createUser(['password' => 'current-password']);

    Sanctum::actingAs($user, ['api-access']);

    $response = $this->postJson(route('profile.update'), [
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors']);

    $response = $this->postJson(route('profile.update'), [
        'current_password' => 'wrong-password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors']);

    $response = $this->postJson(route('profile.update'), [
        'current_password' => 'current-password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertStatus(200);
});

test('user cannot update profile without authentication', function () {
    $response = $this->postJson(route('profile.update'), [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);

    $response->assertStatus(401);
});
