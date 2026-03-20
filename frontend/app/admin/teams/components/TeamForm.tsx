import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const teamSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  abbreviation: z
    .string()
    .length(3, "Sigla deve ter exatamente 3 caracteres")
    .regex(/^[A-Za-z]+$/, "Sigla deve conter apenas letras"),
});

export type TeamFormValues = z.infer<typeof teamSchema>;

export function TeamForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues?: Partial<TeamFormValues>;
  onSubmit: (values: TeamFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", abbreviation: "", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" placeholder="Ex: Flamengo" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abbreviation">Sigla (3 letras)</Label>
        <Input
          id="abbreviation"
          placeholder="Ex: FLA"
          maxLength={3}
          className="uppercase"
          {...register("abbreviation", {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
        />
        {errors.abbreviation && (
          <p className="text-xs text-destructive">
            {errors.abbreviation.message}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
