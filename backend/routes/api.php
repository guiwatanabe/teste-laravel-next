<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');

    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');

    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum')->name('user');

    Route::post('refresh-token', [AuthController::class, 'refresh'])->name('refresh-token');

    Route::post('register', [AuthController::class, 'register'])->name('register');

    Route::post('profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum')->name('profile.update');
});

Route::prefix('teams')->middleware('auth:sanctum')->group(function () {

    Route::get('/', [TeamController::class, 'index'])->name('teams.index');
    Route::get('/{id}', [TeamController::class, 'show'])->whereNumber('id')->name('teams.show');
    Route::post('/', [TeamController::class, 'store'])->name('teams.store');
});
