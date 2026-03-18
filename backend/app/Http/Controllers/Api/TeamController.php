<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Http\Request;
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

        return new TeamResource($team);

    }

    #[Authorize('viewAny', Team::class)]
    public function show(Request $request, int $id)
    {
        $team = Team::findOrFail($id);

        if ($request->user()->cannot('view', $team)) {
            return $this->errorResponse('Você não tem permissão para visualizar os times.', 403);
        }

        return new TeamResource($team);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Team $team)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeamRequest $request, Team $team)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        //
    }
}
