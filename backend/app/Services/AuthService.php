<?php

namespace App\Services;

use App\Models\User;

class AuthService
{
    public function generateTokens(User $user): array
    {
        $accessTokenExpiration = now()->addMinutes(config('sanctum.expiration'));
        $refreshTokenExpiration = now()->addMinutes(config('sanctum.expiration_refresh'));

        $accessToken = $user->createToken('access_token', ['access-api'], $accessTokenExpiration);
        $refreshToken = $user->createToken('refresh_token', ['refresh-access-token'], $refreshTokenExpiration);

        return [
            'accessToken' => $accessToken->plainTextToken,
            'refreshToken' => $refreshToken->plainTextToken,
        ];
    }

    public function revokeTokens(User $user): void
    {
        $user->tokens()->delete();
    }
}
