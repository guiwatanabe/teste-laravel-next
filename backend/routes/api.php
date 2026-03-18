<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login')->middleware('throttle:5,1,api-login');
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
    Route::patch('/{id}', [TeamController::class, 'update'])->whereNumber('id')->name('teams.update');
    Route::delete('/{id}', [TeamController::class, 'destroy'])->whereNumber('id')->name('teams.destroy');
});

Route::prefix('games')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [GameController::class, 'index'])->name('games.index');
    Route::get('/{id}', [GameController::class, 'show'])->whereNumber('id')->name('games.show');
    Route::post('/', [GameController::class, 'store'])->name('games.store');
});
