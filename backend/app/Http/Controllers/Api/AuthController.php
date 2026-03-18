<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends BaseController
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return $this->errorResponse('Endereço de e-mail ou senha inválidos.', 401);
        }

        $user = Auth::user();
        $tokens = $this->authService->generateTokens($user);

        return $this->tokenResponseWithCookie($tokens);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->authService->revokeTokens($user);
        $cookie = cookie()->forget('refresh_token');

        return $this->successResponse('Logout realizado com sucesso.')->withCookie($cookie);
    }

    public function refresh(Request $request): JsonResponse
    {
        if (! $request->hasCookie('refresh_token')) {
            return $this->errorResponse('Refresh token inválido.', 401);
        }

        $cookie = $request->cookie('refresh_token');
        $token = PersonalAccessToken::findToken($cookie);

        if (! $token || $token->cant('refresh-access-token') || $token->expires_at?->isPast() || ! $token->tokenable) {
            return $this->errorResponse('Refresh token inválido.', 401);
        }

        $token->delete();
        $tokens = $this->authService->generateTokens($token->tokenable);

        return $this->tokenResponseWithCookie($tokens);
    }

    public function user(Request $request): JsonResponse
    {
        return $this->successResponse('Usuário autenticado.', 200, [
            'user' => $request->user()->only(['id', 'name', 'email']),
        ]);
    }

    private function tokenResponseWithCookie(array $tokens): JsonResponse
    {
        $refreshTokenExpiration = config('sanctum.expiration_refresh');

        $cookie = cookie(
            'refresh_token',
            $tokens['refreshToken'],
            $refreshTokenExpiration,
            secure: true,
            httpOnly: true,
            sameSite: 'none'
        );

        return response()->json([
            'status' => 'success',
            'access_token' => $tokens['accessToken'],
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.expiration') * 60,
        ])->withCookie($cookie);
    }
}
