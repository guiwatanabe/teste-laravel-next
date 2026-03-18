<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class TeamController extends BaseController
{
    #[Authorize('viewAny', Team::class)]
    public function index()
    {
        return TeamResource::collection(Team::paginate(10));
    }

    #[Authorize('create', Team::class)]
    public function store(StoreTeamRequest $request)
    {
        $data = $request->validated();
        $team = Team::create($data);

        return response()->json(new TeamResource($team), 201);
    }

    #[Authorize('view', Team::class)]
    public function show(int $id)
    {
        $team = Team::findOrFail($id);

        return new TeamResource($team);
    }

    #[Authorize('update', Team::class)]
    public function update(UpdateTeamRequest $request, int $id)
    {
        $team = Team::findOrFail($id);

        $data = $request->validated();
        $team->update($data);

        return new TeamResource($team);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        //
    }
}
