"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getUser, updateProfile, ProfileValidationError, type UserProfile } from "@/services/auth";
import { toast } from "sonner";

const profileSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(255, "O nome deve ter menos de 255 caracteres"),
    email: z.email("E-mail inválido").max(255, "O e-mail deve ter menos de 255 caracteres"),
    current_password: z.string().optional(),
    password: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 8, "A senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.current_password) return false;
      return true;
    },
    { message: "A senha atual é obrigatória para alterar a senha", path: ["current_password"] },
  )
  .refine(
    (data) => {
      if (data.password && data.password !== data.password_confirmation) return false;
      return true;
    },
    { message: "A confirmação da senha não corresponde", path: ["password_confirmation"] },
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const role = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", current_password: "", password: "", password_confirmation: "" },
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!role) return;
    getUser()
      .then((u) => {
        setUser(u);
        reset({ name: u.name, email: u.email, current_password: "", password: "", password_confirmation: "" });
      })
      .catch(() => toast.error("Falha ao carregar perfil"))
      .finally(() => setLoading(false));
  }, [role, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    setSubmitting(true);

    const payload: Record<string, string> = {};
    if (values.name !== user?.name) payload.name = values.name;
    if (values.email !== user?.email) payload.email = values.email;
    if (values.password) {
      payload.current_password = values.current_password!;
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation!;
    }

    updateProfile(payload)
      .then((updated) => {
        setUser(updated);
        reset({ name: updated.name, email: updated.email, current_password: "", password: "", password_confirmation: "" });
        toast.success("Perfil atualizado com sucesso");
      })
      .catch((err: Error) => {
        if (err instanceof ProfileValidationError) {
          Object.entries(err.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ProfileFormValues, {
              message: (messages as string[])[0],
            });
          });
          toast.error(err.message);
        } else {
          toast.error(err.message || "Falha ao atualizar perfil");
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (!role || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar role={role} />

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize seu nome, e-mail ou senha.
        </p>
        <Separator className="my-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground -mb-2">
            Deixe os campos de senha em branco para não alterá-la.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_password">Senha atual</Label>
            <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password")} />
            {errors.current_password && (
              <p className="text-xs text-destructive">{errors.current_password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
            <Input id="password_confirmation" type="password" autoComplete="new-password" {...register("password_confirmation")} />
            {errors.password_confirmation && (
              <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting || !isDirty}>
              {submitting ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
