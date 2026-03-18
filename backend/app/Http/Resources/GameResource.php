<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'home_team' => new TeamResource($this->whenLoaded('homeTeam')),
            'away_team' => new TeamResource($this->whenLoaded('awayTeam')),
            'home_team_goals' => $this->home_team_goals,
            'away_team_goals' => $this->away_team_goals,
            'played_at' => $this->played_at,
            'status' => $this->status,
        ];
    }
}
