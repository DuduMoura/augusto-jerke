"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const houses = [
  { value: "GRYFFINDOR", label: "Grifinória", color: "bg-red-700 hover:bg-red-800", emoji: "🦁" },
  { value: "HUFFLEPUFF", label: "Lufa-Lufa", color: "bg-yellow-500 hover:bg-yellow-600", emoji: "🦡" },
  { value: "RAVENCLAW", label: "Corvinal", color: "bg-blue-700 hover:bg-blue-800", emoji: "🦅" },
  { value: "SLYTHERIN", label: "Sonserina", color: "bg-green-700 hover:bg-green-800", emoji: "🐍" },
] as const;

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(20, "Máximo 20 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirm: z.string(),
    house: z.enum(["GRYFFINDOR", "HUFFLEPUFF", "RAVENCLAW", "SLYTHERIN"]),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const selectedHouse = watch("house");

  async function onSubmit(data: RegisterForm) {
    setApiError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        house: data.house,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setApiError(json.error ?? "Erro ao criar conta");
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Potterdle</CardTitle>
          <CardDescription>Crie sua conta e escolha sua casa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="username" {...register("username")} disabled={isSubmitting} />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} disabled={isSubmitting} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} disabled={isSubmitting} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="passwordConfirm">Confirmar senha</Label>
              <Input id="passwordConfirm" type="password" autoComplete="new-password" {...register("passwordConfirm")} disabled={isSubmitting} />
              {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Casa de Hogwarts</Label>
              <div className="grid grid-cols-2 gap-2">
                {houses.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => setValue("house", h.value, { shouldValidate: true })}
                    className={`p-3 rounded-lg text-white font-medium transition-all ${h.color} ${
                      selectedHouse === h.value ? "ring-2 ring-white ring-offset-2" : "opacity-70"
                    }`}
                    disabled={isSubmitting}
                  >
                    {h.emoji} {h.label}
                  </button>
                ))}
              </div>
              {errors.house && <p className="text-sm text-destructive">{errors.house.message}</p>}
            </div>

            {apiError && <p className="text-sm text-destructive text-center">{apiError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="underline text-foreground">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
