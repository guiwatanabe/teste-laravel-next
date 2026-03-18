<?php

test('user can register with valid input', function () {
    $response = $this->postJson(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure(['status', 'message', 'data' => ['user' => ['id', 'name', 'email']]]);
});

test('user cannot register with invalid input', function () {
    $response = $this->postJson(route('register'), [
        'name' => '',
        'email' => 'invalid-email',
        'password' => 'short',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors' => ['name', 'email', 'password']]);
});

test('user cannot register with existing email', function () {
    createUser(['email' => 'test@example.com']);

    $response = $this->postJson(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['status', 'message', 'errors' => ['email']]);
});

test('user gets assigned to correct role', function () {
    $response = $this->postJson(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'role' => 'user',
    ]);
});

test('role input not processed on registration', function () {
    $response = $this->postJson(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'role' => 'admin',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'role' => 'user',
    ]);
});
