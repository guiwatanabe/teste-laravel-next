<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    public function errorResponse(string $message, int $status = 500): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $status);
    }

    public function successResponse(string $message, int $status = 200, array $data = []): JsonResponse
    {
        $response = [
            'status' => 'success',
            'message' => $message,
        ];

        if (! empty($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }
}
