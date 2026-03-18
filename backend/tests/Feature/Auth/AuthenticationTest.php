<?php

use Illuminate\Support\Facades\Hash;

it('user can login with valid credentials', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['status', 'access_token', 'refresh_token', 'token_type', 'expires_in']);
});

it('user cannot login with invalid credentials', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'invalid-password',
    ]);

    $response->assertStatus(401);
    $response->assertJson([
        'status' => 'error',
        'message' => 'Endereço de e-mail ou senha inválidos.',
    ]);
});

it('logout invalidates tokens', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $access_token = $response->json('access_token');
    $refresh_token = $response->json('refresh_token');

    $this->withHeaders([
        'Authorization' => 'Bearer '.$access_token,
    ])->postJson('/api/auth/logout')
        ->assertStatus(200);

    $this->withHeaders([
        'Authorization' => 'Bearer '.$access_token,
    ])->getJson('/api/user')
        ->assertStatus(401);

    $this->postJson('/api/auth/refresh', [
        'refresh_token' => $refresh_token,
    ])->assertStatus(401);

    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_id' => $user->id,
    ]);
});

it('user can refresh tokens', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $refresh_token = $response->json('refresh_token');

    $this->postJson('/api/auth/refresh', [
        'refresh_token' => $refresh_token,
    ])->assertStatus(200);
});

it('refresh token cannot be used more than once', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $refresh_token = $response->json('refresh_token');

    $this->postJson('/api/auth/refresh', [
        'refresh_token' => $refresh_token,
    ])->assertStatus(200);

    $this->postJson('/api/auth/refresh', [
        'refresh_token' => $refresh_token,
    ])->assertStatus(401);
});

it('cannot use invalid refresh token', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $access_token = $response->json('access_token');

    $this->withHeaders([
        'Authorization' => 'Bearer '.$access_token,
    ])->postJson('/api/auth/refresh', [
        'refresh_token' => 'invalid-refresh-token',
    ])->assertStatus(401);
});
