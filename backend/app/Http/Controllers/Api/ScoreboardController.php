<?php

namespace App\Http\Controllers\Api;

use App\Services\ScoreboardService;
use Illuminate\Http\JsonResponse;

class ScoreboardController extends BaseController
{
    public function __construct(private readonly ScoreboardService $scoreboardService) {}

    public function index(): JsonResponse
    {
        $standings = $this->scoreboardService->getStandings();

        return $this->successResponse('Placar atualizado com sucesso.', 200, $standings);
    }
}
