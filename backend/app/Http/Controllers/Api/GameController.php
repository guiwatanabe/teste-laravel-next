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

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        //
    }

    #[Authorize('view', Game::class)]
    public function show(int $id)
    {
        $game = Game::with(['homeTeam', 'awayTeam'])->findOrFail($id);

        return new GameResource($game);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Game $game)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        //
    }
}
