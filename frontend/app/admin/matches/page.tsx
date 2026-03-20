"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getGames, type Game } from "@/services/games";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function MatchesPageInner() {
  const role = useAuth();
  const router = useRouter();

  const [page, setPage] = useState(1);

  const searchParams = useSearchParams();
  const [teamName, setTeamName] = useState(
    () => searchParams.get("team_name") ?? "",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<"scheduled" | "finished" | "">("");
  const [appliedFilters, setAppliedFilters] = useState<{
    team_name?: string;
    played_at_from?: string;
    played_at_to?: string;
    status?: "scheduled" | "finished";
  }>(() => ({
    team_name: searchParams.get("team_name") || undefined,
  }));

  const {
    data: games,
    meta,
    loading,
  } = usePaginatedFetch<Game>(
    () => getGames({ ...appliedFilters, page }),
    [page, appliedFilters],
    { role, errorMessage: "Falha ao carregar as partidas" },
  );

  const handleFilter = () => {
    setPage(1);
    const resolvedStatus = status === "" || status === ("all" as string) ? undefined : status;
    setAppliedFilters({
      team_name: teamName || undefined,
      played_at_from: dateFrom || undefined,
      played_at_to: dateTo || undefined,
      status: resolvedStatus,
    });
  };

  const handleClear = () => {
    setTeamName("");
    setDateFrom("");
    setDateTo("");
    setStatus("");
    setPage(1);
    setAppliedFilters({});
  };

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
        <h1 className="text-2xl font-semibold">Partidas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resultados e placares das partidas.
        </p>
        <Separator className="my-6" />

        <div className="mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Time</label>
            <Input
              placeholder="Nome do time"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              className="w-48"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select onValueChange={(v) => setStatus(v as "scheduled" | "finished" | "")} value={status}>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="finished">Finalizada</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground invisible">.</label>
            <div className="flex gap-2">
              <Button onClick={handleFilter}>Filtrar</Button>
              <Button variant="outline" onClick={handleClear}>Limpar</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
          </div>
        ) : games.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            Nenhuma partida encontrada.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Time da Casa
                    </th>
                    <th className="px-4 py-3 text-center font-medium w-24">
                      Placar
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Time Visitante
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="border-t border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/matches/${game.id}`)}
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(game.played_at)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {game.home_team.name}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({game.home_team.abbreviation})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold tabular-nums">
                        {game.status === "finished"
                          ? `${game.home_team_goals} - ${game.away_team_goals}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {game.away_team.name}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({game.away_team.abbreviation})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[game.status] ?? ""}`}
                        >
                          {STATUS_LABEL[game.status] ?? game.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {meta.from}-{meta.to} de {meta.total} partidas
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-2">
                    {page} / {meta.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === meta.last_page}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesPageInner />
    </Suspense>
  );
}
