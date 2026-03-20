"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getGame, type Game } from "@/services/games";
import { toast } from "sonner";
import { ScoreModal } from "./components/ScoreModal";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  finished: "Finalizada",
};

const STATUS_CLASS: Record<string, string> = {
  scheduled:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  finished:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchDetailPage() {
  const role = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    getGame(Number(id))
      .then((g) => {
        if (!cancelled) setGame(g);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Partida não encontrada");
          router.replace("/admin/matches");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, id, router]);

  if (!role || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar role={role} />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-semibold">Detalhes da Partida</h1>
        <Separator className="my-6" />

        <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <p className="text-lg font-semibold">{game.home_team.name}</p>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                {game.home_team.abbreviation}
              </p>
            </div>

            <div className="text-center px-4">
              {game.status === "finished" ? (
                <p className="text-3xl font-bold tabular-nums">
                  {game.home_team_goals} – {game.away_team_goals}
                </p>
              ) : (
                <p className="text-xl font-medium text-muted-foreground">vs</p>
              )}
            </div>

            <div className="flex-1 text-center">
              <p className="text-lg font-semibold">{game.away_team.name}</p>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                {game.away_team.abbreviation}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span>{formatDate(game.played_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[game.status] ?? ""}`}
              >
                {STATUS_LABEL[game.status] ?? game.status}
              </span>
            </div>
          </div>

          {role === "admin" && game.status === "scheduled" && (
            <div className="border-t border-border pt-4">
              <Button onClick={() => setShowModal(true)}>
                Registrar Resultado
              </Button>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ScoreModal
          game={game}
          onClose={() => setShowModal(false)}
          onSuccess={(updated) => setGame(updated)}
        />
      )}
    </div>
  );
}
