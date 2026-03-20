import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateGameScore, type Game } from "@/services/games";
import { toast } from "sonner";

const scoreSchema = z.object({
  home_team_goals: z
    .number({ message: "Insira um número" })
    .int("Deve ser um inteiro")
    .min(0, "Não pode ser negativo"),
  away_team_goals: z
    .number({ message: "Insira um número" })
    .int("Deve ser um inteiro")
    .min(0, "Não pode ser negativo"),
});

export type ScoreFormValues = z.infer<typeof scoreSchema>;

export function ScoreModal({
  game,
  onClose,
  onSuccess,
}: {
  game: Game;
  onClose: () => void;
  onSuccess: (updated: Game) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { home_team_goals: 0, away_team_goals: 0 },
    reValidateMode: 'onChange',
  });

  const onSubmit = (values: ScoreFormValues) => {
    setSubmitting(true);
    updateGameScore(game.id, values)
      .then((updated) => {
        toast.success("Resultado registrado com sucesso");
        onSuccess(updated);
        onClose();
      })
      .catch((err: Error) =>
        toast.error(err.message || "Falha ao registrar resultado"),
      )
      .finally(() => setSubmitting(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold">Registrar Resultado</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {game.home_team.name} vs {game.away_team.name}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="home_team_goals">
                {game.home_team.abbreviation}{" "}
                <span className="text-muted-foreground">(casa)</span>
              </Label>
              <Input
                id="home_team_goals"
                type="number"
                min={0}
                {...register("home_team_goals", { valueAsNumber: true })}
              />
              {errors.home_team_goals && (
                <p className="text-xs text-destructive">
                  {errors.home_team_goals.message}
                </p>
              )}
            </div>

            <span className="mt-8 text-lg font-bold text-muted-foreground">
              –
            </span>

            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="away_team_goals">
                {game.away_team.abbreviation}{" "}
                <span className="text-muted-foreground">(visit.)</span>
              </Label>
              <Input
                id="away_team_goals"
                type="number"
                min={0}
                {...register("away_team_goals", { valueAsNumber: true })}
              />
              {errors.away_team_goals && (
                <p className="text-xs text-destructive">
                  {errors.away_team_goals.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
