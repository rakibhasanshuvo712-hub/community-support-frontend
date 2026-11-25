"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setTokenAndRefresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      const data = await apiFetch<{ session: { access_token: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      await setTokenAndRefresh(data.session.access_token);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Login failed");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail }),
      });
      setResetSent(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not send reset email");
    }
  };

  return (
    <div className="mx-auto flex max-w-md px-4 py-14">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.loginTitle}</CardTitle>
          <p className="text-sm text-slate-600">{t.auth.loginSubtitle}</p>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {serverError}
            </div>
          )}

          {!showReset ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.auth.email}</label>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.auth.password}</label>
                <Input type="password" {...register("password")} />
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "..." : t.auth.signInBtn}
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <button type="button" onClick={() => setShowReset(true)} className="hover:text-emerald-700 hover:underline">
                  {t.auth.forgotPassword}
                </button>
                <Link href="/register" className="font-medium text-emerald-700 hover:underline">
                  {t.nav.register}
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {resetSent ? (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{t.auth.resetSent}</p>
              ) : (
                <>
                  <Input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <Button type="submit" className="w-full">
                    Send Reset Link
                  </Button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                }}
                className="text-xs text-slate-600 hover:underline"
              >
                ← {t.common.back}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
