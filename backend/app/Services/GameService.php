<?php

namespace App\Services;

use App\Models\Game;

class GameService
{
    public function createGame(array $data): Game
    {
        return Game::create([
            'home_team_id' => $data['home_team_id'],
            'away_team_id' => $data['away_team_id'],
            'played_at' => $data['played_at'],
            'status' => 'scheduled',
        ]);
    }

    public function updateGameResult(Game $game, array $data): Game
    {
        $game->home_team_goals = $data['home_team_goals'];
        $game->away_team_goals = $data['away_team_goals'];
        $game->status = 'finished';
        $game->save();

        return $game;
    }

    public function canDeleteGame(Game $game): array
    {
        if ($game->status !== 'finished') {
            return [
                'success' => false,
                'message' => 'Somente jogos finalizados podem ser deletados.',
            ];
        }

        if ($game->played_at->lessThan(now()->subDays(3))) {
            return [
                'success' => false,
                'message' => 'Somente jogos finalizados nos últimos 3 dias podem ser deletados.',
            ];
        }

        return [
            'success' => true,
            'message' => 'O jogo pode ser deletado.',
        ];
    }
}
