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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamRequest $request)
    {
        //
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
