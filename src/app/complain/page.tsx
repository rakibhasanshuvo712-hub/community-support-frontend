"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Flag, CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Post } from "@/types";

export default function ComplainPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { lang, t } = useLanguage();

  const [targetType, setTargetType] = useState<"post" | "user" | "dispute">("dispute");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: postsData } = useQuery({
    queryKey: ["posts", "complain-list"],
    queryFn: () => apiFetch<{ posts: Post[] }>("/posts?limit=30&sort=latest"),
  });

  const posts = postsData?.posts ?? [];

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId);
    const found = posts.find((p) => p.id === postId);
    if (found?.author_id) {
      setTargetUserId(found.author_id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          target_type: targetType,
          target_post_id: selectedPostId || null,
          target_user_id: targetType === "post" ? null : targetUserId || null,
          reason,
          details,
        }),
      });
      setReason("");
      setDetails("");
      setSuccessMsg(
        lang === "bn"
          ? "আপনার অভিযোগ জমা দেওয়া হয়েছে। অ্যাডমিন এটি পর্যালোচনা করবেন।"
          : "Your complaint has been submitted. An administrator will review it in the Admin Panel."
      );
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="p-8">
          <Flag className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">
            {lang === "bn" ? "অভিযোগ জানাতে লগইন করুন" : "Sign In to File a Complaint"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {lang === "bn"
              ? "দাতা, গ্রহীতা বা যেকোনো সন্দেহজনক পোস্টের বিরুদ্ধে অভিযোগ করতে অনুগ্রহ করে লগইন করুন।"
              : "Please sign in to submit a complaint against a post, donor, or recipient."}
          </p>
          <Link href="/login">
            <Button className="mt-5">{t.nav.login}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {lang === "bn" ? "অভিযোগ ও ডিসপিউট কেন্দ্র" : "File a Complaint or Dispute"}
              </CardTitle>
              <p className="text-sm text-slate-600">
                {lang === "bn"
                  ? "সন্দেহজনক পোস্ট, দাতা বা গ্রহীতার আচরণ সম্পর্কে অ্যাডমিনকে জানান।"
                  : "Report suspicious posts or file a dispute against a donor or recipient."}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {successMsg && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              <div>
                <p>{successMsg}</p>
                <Link href="/dashboard" className="mt-1 inline-block font-semibold underline">
                  {t.nav.dashboard} →
                </Link>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {lang === "bn" ? "অভিযোগের ধরন" : "Complaint Type"}
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as "post" | "user" | "dispute")}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="dispute">Donor / Recipient Dispute</option>
                <option value="post">Report a Suspicious Post</option>
                <option value="user">Report a User Account</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {lang === "bn" ? "সংশ্লিষ্ট পোস্ট নির্বাচন করুন" : "Select Related Post"}
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => handlePostSelect(e.target.value)}
                required={targetType === "post"}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">-- Select a post --</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.author?.full_name || "Member"})
                  </option>
                ))}
              </select>
            </div>

            {targetType !== "post" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "অভিযুক্ত ব্যবহারকারীর আইডি" : "User ID Being Complained Against"}
                </label>
                <Input
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Auto-filled when you pick a post, or paste User ID"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {lang === "bn" ? "অভিযোগের কারণ" : "Reason"}
              </label>
              <Input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., No-show at handover, fake request, inappropriate behavior"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {lang === "bn" ? "বিস্তারিত বিবরণ" : "Details"}
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Describe what happened so our admin team can investigate..."
              />
            </div>

            <Button type="submit" variant="destructive" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : lang === "bn" ? "অভিযোগ জমা দিন" : "Submit Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
