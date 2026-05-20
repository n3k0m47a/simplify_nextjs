"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const registerSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein.")
    .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten.")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten."),
});

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.signUp.email(value);
      if (error) {
        setServerError(error.message ?? "Registrierung fehlgeschlagen.");
      } else {
        router.push("/dashboard");
      }
    },
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Konto erstellen</CardTitle>
        <CardDescription>
          Erstelle ein neues Konto mit deiner E-Mail-Adresse.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardContent className="flex flex-col gap-4">
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                registerSchema.shape.name.safeParse(value).error?.issues[0]
                  ?.message,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Max Mustermann"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) =>
                registerSchema.shape.email.safeParse(value).error?.issues[0]
                  ?.message,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@beispiel.de"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) =>
                registerSchema.shape.password.safeParse(value).error?.issues[0]
                  ?.message,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Passwort</Label>
                <PasswordInput
                  id="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Konto wird erstellt…" : "Konto erstellen"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-sm text-muted-foreground text-center">
            Bereits ein Konto?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Anmelden
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
