<?php

namespace App\Services;

use App\Models\Team;

class ScoreboardService
{
    /**
     * Calculate team points per game
     */
    private function calculateTeamScore(Team $team): int
    {
        $points = 0;
        foreach ($team->homeGames as $game) {
            if ($game->home_team_goals > $game->away_team_goals) {
                $points += 3;
            } elseif ($game->home_team_goals === $game->away_team_goals) {
                $points += 1;
            }
        }

        foreach ($team->awayGames as $game) {
            if ($game->away_team_goals > $game->home_team_goals) {
                $points += 3;
            } elseif ($game->away_team_goals === $game->home_team_goals) {
                $points += 1;
            }
        }

        return $points;
    }

    /**
     * Count results by win/draw/loss
     */
    private function countResults(Team $team, string $result): int
    {
        $count = 0;

        foreach ($team->homeGames as $game) {
            $isWin = $game->home_team_goals > $game->away_team_goals;
            $isDraw = $game->home_team_goals === $game->away_team_goals;
            if ($result === 'win' && $isWin) {
                $count++;
            }
            if ($result === 'draw' && $isDraw) {
                $count++;
            }
            if ($result === 'loss' && ! $isWin && ! $isDraw) {
                $count++;
            }
        }

        foreach ($team->awayGames as $game) {
            $isWin = $game->away_team_goals > $game->home_team_goals;
            $isDraw = $game->away_team_goals === $game->home_team_goals;
            if ($result === 'win' && $isWin) {
                $count++;
            }
            if ($result === 'draw' && $isDraw) {
                $count++;
            }
            if ($result === 'loss' && ! $isWin && ! $isDraw) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Get standings, organized in an array
     */
    public function getStandings(): array
    {
        $teams = Team::with([
            'homeGames' => fn ($q) => $q->where('status', 'finished'),
            'awayGames' => fn ($q) => $q->where('status', 'finished'),
        ])->get();

        $standings = $teams->map(fn (Team $team) => [
            'team_id' => $team->id,
            'team_name' => $team->name,
            'points' => $this->calculateTeamScore($team),
            'games' => $team->homeGames->count() + $team->awayGames->count(),
            'wins' => $this->countResults($team, 'win'),
            'draws' => $this->countResults($team, 'draw'),
            'losses' => $this->countResults($team, 'loss'),
            'goals_for' => $team->homeGames->sum('home_team_goals') + $team->awayGames->sum('away_team_goals'),
            'goals_against' => $team->homeGames->sum('away_team_goals') + $team->awayGames->sum('home_team_goals'),
            'goal_difference' => ($team->homeGames->sum('home_team_goals') + $team->awayGames->sum('away_team_goals'))
                - ($team->homeGames->sum('away_team_goals') + $team->awayGames->sum('home_team_goals')),
        ])->toArray();

        $points = array_column($standings, 'points');
        $goalDiff = array_column($standings, 'goal_difference');
        $goalsFor = array_column($standings, 'goals_for');

        array_multisort(
            $points,
            SORT_DESC,
            $goalDiff,
            SORT_DESC,
            $goalsFor,
            SORT_DESC,
            $standings
        );

        return $standings;
    }
}
