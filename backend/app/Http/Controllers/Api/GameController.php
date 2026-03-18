<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class GameController extends BaseController
{
    #[Authorize('viewAny', Game::class)]
    public function index()
    {
        return GameResource::collection(Game::with(['homeTeam', 'awayTeam'])->paginate(10));
    }

    #[Authorize('create', Game::class)]
    public function store(StoreGameRequest $request)
    {
        $data = $request->validated();
        $game = Game::create([
            'home_team_id' => $data['home_team_id'],
            'away_team_id' => $data['away_team_id'],
            'played_at' => $data['played_at'],
            'status' => 'scheduled',
        ]);

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

        $data = $request->validated();
        $data['status'] = 'finished';
        $game->update($data);

        return new GameResource($game->load(['homeTeam', 'awayTeam']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        //
    }
}
