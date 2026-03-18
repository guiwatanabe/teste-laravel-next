<?php

use Laravel\Sanctum\PersonalAccessToken;

test('user can login with valid credentials', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['status', 'access_token', 'token_type', 'expires_in']);
});

test('user cannot login without required fields', function () {
    $response = $this->postJson(route('login'), [
        'email' => '',
        'password' => '',
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'status' => 'error',
        'message' => 'Endereço de e-mail ou senha inválidos.',
    ]);
});

test('user cannot login with invalid credentials', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'invalid-password',
    ]);

    $response->assertStatus(401);
    $response->assertJson([
        'status' => 'error',
        'message' => 'Endereço de e-mail ou senha inválidos.',
    ]);
});

test('logout invalidates tokens', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $access_token = $response->json('access_token');

    $this->withHeaders([
        'Authorization' => 'Bearer '.$access_token,
    ])->postJson(route('logout'))
        ->assertStatus(200);

    $this->assertEquals(0, PersonalAccessToken::where('tokenable_id', $user->id)->count());
});

test('user can refresh tokens', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $cookie = $response->getCookie('refresh_token', false);
    $refresh_token = $cookie ? $cookie->getValue() : null;

    $this->travel(config('sanctum.expiration') + 5)->minutes();

    $response = $this->withUnencryptedCookie('refresh_token', $refresh_token)
        ->withCredentials()
        ->postJson(route('refresh-token'))
        ->assertStatus(200)
        ->assertJsonStructure(['status', 'access_token', 'token_type', 'expires_in']);
});

test('refresh token cannot be used more than once', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $cookie = $response->getCookie('refresh_token', false);
    $refresh_token = $cookie ? $cookie->getValue() : null;

    $this->withUnencryptedCookie('refresh_token', $refresh_token)
        ->withCredentials()
        ->postJson(route('refresh-token'), [
            'refresh_token' => $refresh_token,
        ])->assertStatus(200);

    $this->withUnencryptedCookie('refresh_token', $refresh_token)
        ->withCredentials()
        ->postJson(route('refresh-token'), [
            'refresh_token' => $refresh_token,
        ])->assertStatus(401);
});

test('cannot use invalid refresh token', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $access_token = $response->json('access_token');

    $this->withHeaders([
        'Authorization' => 'Bearer '.$access_token,
    ])->postJson(route('refresh-token'), [
        'refresh_token' => 'invalid-refresh-token',
    ])->assertStatus(401);
});

test('rate limits after 5 requests per minute', function () {
    $user = createUser([
        'email' => 'user@example.com',
        'password' => 'password',
    ]);

    for ($i = 1; $i <= 5; $i++) {
        $response = $this->postJson(route('login'), [
            'email' => $user->email,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
        $response->assertHeader('X-Ratelimit-Remaining', 5 - $i);
    }

    $response = $this->postJson(route('login'), [
        'email' => $user->email,
        'password' => 'wrong_password',
    ]);

    $response->assertStatus(429);
    $response->assertHeader('X-Ratelimit-Remaining', 0);
});
