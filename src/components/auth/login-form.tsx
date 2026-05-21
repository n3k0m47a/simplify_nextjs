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

const loginSchema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  password: z.string().min(1, "Passwort ist erforderlich."),
});

function getSafeRedirect(url: string | undefined): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) return url;
  return "/dashboard";
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const { error } = await authClient.signIn.email(value);
        if (error) {
          setServerError(error.message ?? "Anmeldung fehlgeschlagen.");
        } else {
          router.push(getSafeRedirect(callbackUrl));
        }
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : "Anmeldung fehlgeschlagen."
        );
      }
    },
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>
          Melde dich mit deiner E-Mail-Adresse an.
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
            name="email"
            validators={{
              onBlur: ({ value }) =>
                loginSchema.shape.email.safeParse(value).error?.issues[0]
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
                loginSchema.shape.password.safeParse(value).error?.issues[0]
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
                {isSubmitting ? "Anmelden…" : "Anmelden"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-sm text-muted-foreground text-center">
            Noch kein Konto?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Registrieren
            </Link>
          </p>
          {process.env.NODE_ENV === "development" && (
            <p>
              <Button variant="outline" size="sm" onClick={() => { form.setFieldValue("email", "max@local.test"); form.setFieldValue("password", "Passw0rd"); }}>
                max@local.test
              </Button>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
