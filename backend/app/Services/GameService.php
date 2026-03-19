<?php

namespace App\Services;

use App\Models\Game;
use Illuminate\Support\Facades\DB;

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
        return DB::transaction(function () use ($game, $data) {
            $lockedGame = Game::query()
                ->whereKey($game->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedGame->home_team_goals = $data['home_team_goals'];
            $lockedGame->away_team_goals = $data['away_team_goals'];
            $lockedGame->status = 'finished';
            $lockedGame->played_at = now();

            $lockedGame->save();

            return $lockedGame->fresh();
        });
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
