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

const bdPhoneRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .refine((v) => bdPhoneRegex.test(v), {
      message: "Enter a valid Bangladesh mobile number (e.g. 01712345678 or +8801712345678)",
    }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { setTokenAndRefresh } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      const data = await apiFetch<{
        session: { access_token: string } | null;
        requires_email_verification: boolean;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: values.full_name,
          phone: values.phone,
          email: values.email || undefined,
          password: values.password,
          preferred_language: lang,
        }),
      });

      if (data.session?.access_token) {
        await setTokenAndRefresh(data.session.access_token);
        router.push("/dashboard");
      } else {
        setVerifyNotice(true);
      }
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex max-w-md px-4 py-14">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
          <p className="text-sm text-slate-600">
            {lang === "bn"
              ? "আপনার বাংলাদেশি মোবাইল নম্বর দিয়ে সহায়তা একাউন্ট খুলুন"
              : "Create your Sahayata account with your Bangladesh mobile number"}
          </p>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {serverError}
            </div>
          )}

          {verifyNotice ? (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p>Account created! You can now sign in with your phone number.</p>
              <Link href="/login">
                <Button className="w-full">{t.nav.login}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.auth.fullName}</label>
                <Input {...register("full_name")} placeholder="Ayesha Rahman" />
                {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "বাংলাদেশ মোবাইল নম্বর" : "Bangladesh Phone Number"}
                </label>
                <Input type="tel" {...register("phone")} placeholder="01712345678" />
                <p className="mt-1 text-xs text-slate-500">Format: 01XXXXXXXXX or +8801XXXXXXXXX</p>
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
                </label>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.auth.password}</label>
                <Input type="password" {...register("password")} placeholder="Min 8 characters" />
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "..." : t.auth.registerBtn}
              </Button>

              <p className="text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-emerald-700 hover:underline">
                  {t.nav.login}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
