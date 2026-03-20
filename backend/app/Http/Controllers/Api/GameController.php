<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Services\GameService;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class GameController extends BaseController
{
    public function __construct(private readonly GameService $gameService) {}

    #[Authorize('viewAny', Game::class)]
    public function index()
    {
        $validated = request()->validate([
            'team_name' => 'nullable|string|max:255',
            'played_at_from' => 'nullable|date',
            'played_at_to' => 'nullable|date|after_or_equal:played_at_from',
        ]);

        $query = Game::with(['homeTeam', 'awayTeam'])
            ->orderBy('played_at', 'desc')
            ->withTeamName($validated['team_name'] ?? null)
            ->playedAtFrom($validated['played_at_from'] ?? null)
            ->playedAtTo($validated['played_at_to'] ?? null);

        return GameResource::collection($query->paginate(10));
    }

    #[Authorize('create', Game::class)]
    public function store(StoreGameRequest $request)
    {
        $data = $request->validated();
        $game = $this->gameService->createGame($data);

        return response()->json(new GameResource($game->load(['homeTeam', 'awayTeam'])), 201);
    }

    #[Authorize('view', Game::class)]
    public function show(int $id)
    {
        $game = Game::with(['homeTeam', 'awayTeam'])->findOrFail($id);

        return new GameResource($game);
    }

    #[Authorize('update', Game::class)]
    public function update(UpdateGameRequest $request, int $id)
    {
        $game = Game::findOrFail($id);

        if ($game->played_at->greaterThan(now())) {
            return $this->errorResponse('Resultados só podem ser atualizados para jogos passados.', 400);
        }

        $data = $request->validated();
        $game = $this->gameService->updateGameResult($game, $data);

        return new GameResource($game->load(['homeTeam', 'awayTeam']));
    }

    #[Authorize('delete', Game::class)]
    public function destroy(int $id)
    {
        $game = Game::findOrFail($id);

        $gameCanBeDeleted = $this->gameService->canDeleteGame($game);
        if (! $gameCanBeDeleted['success']) {
            return $this->errorResponse($gameCanBeDeleted['message'], 400);
        }

        $game->delete();

        return response()->json(null, 204);
    }
}
