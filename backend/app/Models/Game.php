<?php

namespace App\Models;

use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['home_team_id', 'away_team_id', 'home_team_goals', 'away_team_goals', 'played_at', 'status'])]
class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'played_at' => 'datetime',
        ];
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    /**
     * Scope a query to include games with a team name in home or away teams
     */
    public function scopeWithTeamName(Builder $query, ?string $teamName = null): Builder
    {
        if (! $teamName) {
            return $query;
        }
        $teamName = trim($teamName);

        return $query->where(function (Builder $q) use ($teamName) {
            $q->whereHas('homeTeam', function (Builder $sq) use ($teamName) {
                $sq->where('name', 'like', '%'.$teamName.'%');
            })->orWhereHas('awayTeam', function (Builder $sq) use ($teamName) {
                $sq->where('name', 'like', '%'.$teamName.'%');
            });
        });
    }

    /**
     * Scope to filter games with played_at after a date
     */
    public function scopePlayedAtFrom(Builder $query, ?string $date = null): Builder
    {
        if (! $date) {
            return $query;
        }

        return $query->where('played_at', '>=', $date);
    }

    /**
     * Scope to filter games with played_at before a date
     */
    public function scopePlayedAtTo(Builder $query, ?string $date = null): Builder
    {
        if (! $date) {
            return $query;
        }

        return $query->where('played_at', '<=', $date);
    }
}
