"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Lock, Upload } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Category, Post } from "@/types";

const createPostSchema = z.object({
  post_type: z.enum(["donation_offer", "help_request"]),
  donation_type: z.enum(["item", "money", "service"]),
  category_id: z.string().trim().min(1, "Please select a category"),
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(5000),
  quantity: z.string().optional(),
  unit: z.string().max(40).optional(),
  amount: z.string().optional(),
  currency: z.string().min(3).max(6).default("BDT"),
  location_city: z.string().trim().min(2).max(100),
  location_area: z.string().max(100).optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  safety_acknowledged: z.boolean().default(false),
  exact_handover_address: z.string().max(300).optional(),
  contact_phone: z.string().max(30).optional(),
  contact_note: z.string().max(500).optional(),
});

type CreatePostForm = z.input<typeof createPostSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { lang, t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ categories: Category[] }>("/categories"),
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      post_type: "donation_offer",
      donation_type: "item",
      currency: "BDT",
      urgency: "medium",
      safety_acknowledged: false,
    },
  });

  const selectedCategoryId = watch("category_id");
  const donationType = watch("donation_type");
  const selectedCategory = catData?.categories.find((c) => c.id === selectedCategoryId);

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-xl font-bold">{t.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">Please sign in to publish a donation or help request.</p>
          <Button className="mt-5" onClick={() => router.push("/login")}>
            {t.nav.login}
          </Button>
        </Card>
      </div>
    );
  }

  const onSubmit = async (values: CreatePostForm) => {
    setServerError(null);
    try {
      const payload = {
        ...values,
        quantity: values.quantity ? Number(values.quantity) : null,
        amount: values.amount ? Number(values.amount) : null,
      };
      const { post } = await apiFetch<{ post: Post }>("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        await apiFetch(`/posts/${post.id}/images`, { method: "POST", body: fd });
      }

      if (docFile) {
        const fd = new FormData();
        fd.append("file", docFile);
        await apiFetch(`/posts/${post.id}/documents`, { method: "POST", body: fd });
      }

      router.push(`/posts/${post.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Failed to publish post");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.create.title}</CardTitle>
          <p className="text-sm text-slate-600">{t.create.subtitle}</p>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.postTypeLabel}</label>
                <select
                  {...register("post_type")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="donation_offer">{t.postTypes.donation_offer}</option>
                  <option value="help_request">{t.postTypes.help_request}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.donationTypeLabel}</label>
                <select
                  {...register("donation_type")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="item">{t.donationTypes.item}</option>
                  <option value="money">{t.donationTypes.money}</option>
                  <option value="service">{t.donationTypes.service}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.categoryLabel}</label>
                <select
                  {...register("category_id")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">-- Select --</option>
                  {(catData?.categories ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === "bn" ? cat.name_bn : cat.name_en}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.category_id.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.urgencyLabel}</label>
                <select
                  {...register("urgency")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="low">{t.urgency.low}</option>
                  <option value="medium">{t.urgency.medium}</option>
                  <option value="high">{t.urgency.high}</option>
                  <option value="critical">{t.urgency.critical}</option>
                </select>
              </div>
            </div>

            {selectedCategory?.is_restricted && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <p className="font-medium">
                      {lang === "bn"
                        ? selectedCategory.restriction_note_bn
                        : selectedCategory.restriction_note_en}
                    </p>
                    <label className="mt-3 flex items-center gap-2 font-medium">
                      <input type="checkbox" {...register("safety_acknowledged")} className="h-4 w-4" />
                      <span>{t.create.medicineAck}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">{t.create.titleLabel}</label>
              <Input {...register("title")} placeholder="e.g., Winter blankets for 15 families" />
              {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t.create.descriptionLabel}</label>
              <Textarea {...register("description")} rows={4} />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
              )}
            </div>

            {donationType === "money" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t.create.amountLabel}</label>
                  <Input type="number" step="0.01" {...register("amount")} placeholder="5000" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t.create.currencyLabel}</label>
                  <Input {...register("currency")} defaultValue="BDT" />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t.create.quantityLabel}</label>
                  <Input type="number" step="0.01" {...register("quantity")} placeholder="10" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t.create.unitLabel}</label>
                  <Input {...register("unit")} placeholder="pcs / kg / boxes" />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.cityLabel}</label>
                <Input {...register("location_city")} placeholder="Dhaka" />
                {errors.location_city && (
                  <p className="mt-1 text-xs text-rose-600">{errors.location_city.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t.create.areaLabel}</label>
                <Input {...register("location_area")} placeholder="Dhanmondi" />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Upload className="h-4 w-4 text-emerald-700" />
                  <span>Optional Image (JPG/PNG/WebP, max 5MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-xs text-slate-600"
                />
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="h-4 w-4 text-amber-700" />
                  <span>Private Supporting Document (PDF/Image, max 10MB)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-xs text-slate-600"
                />
              </div>
            </div>

            {/* Private Handover Details */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Lock className="h-4 w-4 text-emerald-700" />
                <span>{t.create.privateSectionTitle}</span>
              </div>
              <p className="text-xs text-slate-600">{t.create.privateSectionHint}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">{t.create.phoneLabel}</label>
                  <Input {...register("contact_phone")} placeholder="+880..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">{t.create.addressLabel}</label>
                  <Input {...register("exact_handover_address")} placeholder="House, Road, Floor..." />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">{t.create.noteLabel}</label>
                <Input {...register("contact_note")} placeholder="Available 5 PM - 8 PM" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t.create.submitting : t.create.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
