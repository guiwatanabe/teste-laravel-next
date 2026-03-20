"use client";

import { useState } from "react";

import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  type Team,
} from "@/services/teams";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { toast } from "sonner";
import { TeamFormValues, TeamForm } from "./components/TeamForm";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareArrowUpRight02Icon } from "@hugeicons/core-free-icons";

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; team: Team }
  | { mode: "delete"; team: Team }
  | null;

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function AdminTeamsPage() {
  const router = useRouter();

  const role = useAuth({ requireRole: "admin" });

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: teams,
    setData: setTeams,
    meta,
    setMeta,
    loading,
  } = usePaginatedFetch<Team>(() => getTeams(page), [page], {
    role,
    errorMessage: "Falha ao carregar os times",
  });

  const closeModal = () => setModal(null);

  const handleCreate = (values: TeamFormValues) => {
    setSubmitting(true);
    createTeam({ ...values, abbreviation: values.abbreviation.toUpperCase() })
      .then((created) => {
        toast.success(`Time "${created.name}" criado com sucesso`);
        closeModal();
        setPage(1);
        setTeams((prev) => [created, ...prev]);
        return getTeams(1);
      })
      .then((res) => {
        setTeams(res.data);
        setMeta(res.meta);
      })
      .catch((err: Error) => toast.error(err.message || "Falha ao criar time"))
      .finally(() => setSubmitting(false));
  };

  const handleEdit = (values: TeamFormValues) => {
    if (modal?.mode !== "edit") return;
    const { team } = modal;
    setSubmitting(true);
    updateTeam(team.id, {
      ...values,
      abbreviation: values.abbreviation.toUpperCase(),
    })
      .then((updated) => {
        toast.success(`Time "${updated.name}" atualizado`);
        setTeams((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
        closeModal();
      })
      .catch((err: Error) =>
        toast.error(err.message || "Falha ao atualizar time"),
      )
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (modal?.mode !== "delete") return;
    const { team } = modal;
    setSubmitting(true);
    deleteTeam(team.id)
      .then(() => {
        toast.success(`Time "${team.name}" excluído`);
        setTeams((prev) => prev.filter((t) => t.id !== team.id));
        closeModal();

        if (teams.length === 1 && page > 1) setPage((p) => p - 1);
      })
      .catch((err: Error) => {
        console.log(err);
        toast.error(err.message || "Falha ao excluir time");
      })
      .finally(() => setSubmitting(false));
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
      <NavBar role="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Gerenciar Times</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administre os times do campeonato.
            </p>
          </div>
          <Button onClick={() => setModal({ mode: "create" })}>
            + Novo Time
          </Button>
        </div>
        <Separator className="my-6" />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
          </div>
        ) : teams.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            Nenhum time cadastrado ainda.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                    <th className="px-4 py-3 text-left font-medium w-24">
                      Sigla
                    </th>
                    <th className="px-4 py-3 text-left font-medium w-24">
                      Jogos
                    </th>
                    <th className="px-4 py-3 text-right font-medium w-32">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className="border-t border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{team.name}</td>
                      <td className="px-4 py-3 font-mono uppercase text-muted-foreground">
                        {team.abbreviation}
                      </td>
                      <td className="px-4 py-3 font-mono flex items-center gap-1">
                        {team.games_count}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full p-1"
                          title="Ver partidas do time"
                          onClick={() =>
                            router.push(
                              `/admin/matches?team_name=${encodeURIComponent(team.name)}`,
                            )
                          }
                        >
                          <HugeiconsIcon icon={SquareArrowUpRight02Icon} className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModal({ mode: "edit", team })}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setModal({ mode: "delete", team })}
                            disabled={(team.games_count ?? 0) > 0}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {meta.from}-{meta.to} de {meta.total} times
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

      {modal?.mode === "create" && (
        <Modal onClose={closeModal}>
          <h2 className="mb-4 text-lg font-semibold">Novo Time</h2>
          <TeamForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal onClose={closeModal}>
          <h2 className="mb-4 text-lg font-semibold">Editar Time</h2>
          <TeamForm
            defaultValues={{
              name: modal.team.name,
              abbreviation: modal.team.abbreviation,
            }}
            onSubmit={handleEdit}
            onCancel={closeModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {modal?.mode === "delete" && (
        <Modal onClose={closeModal}>
          <h2 className="mb-2 text-lg font-semibold">Excluir Time</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Tem certeza que deseja excluir o time{" "}
            <span className="font-medium text-foreground">
              {modal.team.name}
            </span>
            ?
            <br />
            Essa ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Excluindo…" : "Excluir"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
