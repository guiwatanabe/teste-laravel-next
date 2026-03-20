"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getStandings, type StandingEntry } from "@/services/scoreboard";
import { toast } from "sonner";

export default function StandingsPage() {
  const role = useAuth();
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return;
    getStandings()
      .then(setStandings)
      .catch(() => toast.error("Falha ao carregar a classificação"))
      .finally(() => setLoading(false));
  }, [role]);

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar role={role} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">Classificação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tabela de classificação do Brasileirão.
        </p>
        <Separator className="my-6" />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
          </div>
        ) : standings.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            Nenhuma partida finalizada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left font-medium w-8" title="Posição">#</th>
                  <th className="px-3 py-3 text-left font-medium" title="Time">Time</th>
                  <th className="px-3 py-3 text-center font-medium" title="Pontos">P</th>
                  <th className="px-3 py-3 text-center font-medium" title="Jogos">J</th>
                  <th className="px-3 py-3 text-center font-medium" title="Vitórias">V</th>
                  <th className="px-3 py-3 text-center font-medium" title="Empates">E</th>
                  <th className="px-3 py-3 text-center font-medium" title="Derrotas">D</th>
                  <th className="px-3 py-3 text-center font-medium" title="Gols Pró">GP</th>
                  <th className="px-3 py-3 text-center font-medium" title="Gols Contra">GC</th>
                  <th className="px-3 py-3 text-center font-medium" title="Saldo de Gols">SG</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry, index) => (
                  <tr
                    key={entry.team_id}
                    className="border-t border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-3 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-3 font-medium">{entry.team_name}</td>
                    <td className="px-3 py-3 text-center font-bold">{entry.points}</td>
                    <td className="px-3 py-3 text-center">{entry.games}</td>
                    <td className="px-3 py-3 text-center">{entry.wins}</td>
                    <td className="px-3 py-3 text-center">{entry.draws}</td>
                    <td className="px-3 py-3 text-center">{entry.losses}</td>
                    <td className="px-3 py-3 text-center">{entry.goals_for}</td>
                    <td className="px-3 py-3 text-center">{entry.goals_against}</td>
                    <td className="px-3 py-3 text-center">
                      {entry.goal_difference > 0
                        ? `+${entry.goal_difference}`
                        : entry.goal_difference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
