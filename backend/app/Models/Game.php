<?php

namespace App\Models;

use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable('home_team_id', 'away_team_id', 'home_team_goals', 'away_team_goals', 'played_at', 'status')]
class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;
}
