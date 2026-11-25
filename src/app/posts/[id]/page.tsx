"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Lock,
  MessageSquare,
  Flag,
  AlertTriangle,
  FileText,
  HandCoins,
  PackageCheck,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Post } from "@/types";

export default function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [claimMessage, setClaimMessage] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeNote, setPledgeNote] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => apiFetch<{ post: Post }>(`/posts/${id}`),
  });

  const post = data?.post;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionErr(null);
    setActionMsg(null);
    try {
      await apiFetch(`/posts/${id}/claims`, {
        method: "POST",
        body: JSON.stringify({ message: claimMessage }),
      });
      setClaimMessage("");
      setActionMsg("Submitted! The post author has been notified.");
      void queryClient.invalidateQueries({ queryKey: ["post", id] });
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not submit request");
    }
  };

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionErr(null);
    setActionMsg(null);
    try {
      await apiFetch(`/posts/${id}/contributions`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(pledgeAmount),
          currency: post?.currency || "BDT",
          note: pledgeNote,
        }),
      });
      setPledgeAmount("");
      setPledgeNote("");
      setActionMsg(
        "Pledge recorded! Please coordinate direct transfer with the recipient and confirm once sent."
      );
      void queryClient.invalidateQueries({ queryKey: ["post", id] });
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not record pledge");
    }
  };

  const handleMessageAuthor = async () => {
    if (!post) return;
    try {
      const res = await apiFetch<{ conversation_id: string }>("/conversations", {
        method: "POST",
        body: JSON.stringify({ recipient_id: post.author_id, post_id: post.id }),
      });
      router.push(`/messages?conversation=${res.conversation_id}`);
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not start conversation");
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          target_type: "post",
          target_post_id: id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setShowReport(false);
      setReportReason("");
      setReportDetails("");
      setActionMsg("Report submitted to moderators.");
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Failed to submit report");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Card className="p-8">
          <p className="text-slate-600">Post not found or no longer available.</p>
          <Link href="/donations">
            <Button className="mt-4" variant="outline">
              {t.common.back}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === post.author_id;
  const categoryName = lang === "bn" ? post.category?.name_bn : post.category?.name_en;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            {post.images && post.images.length > 0 && post.images[0]?.url && (
              <div className="max-h-96 w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.images[0].url} alt={post.title} className="h-full w-full object-cover" />
              </div>
            )}

            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={post.post_type === "donation_offer" ? "default" : "info"}>
                  {t.postTypes[post.post_type]}
                </Badge>
                <Badge variant="outline">{t.donationTypes[post.donation_type]}</Badge>
                <Badge variant="warning">{t.urgency[post.urgency]}</Badge>
                <Badge variant="secondary">{t.status[post.status]}</Badge>
              </div>
              <CardTitle className="mt-3 text-2xl">{post.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {post.location_city}
                  {post.location_area ? `, ${post.location_area}` : ""}
                </span>
                {categoryName && <span>• {categoryName}</span>}
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {post.category?.is_restricted && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <span>
                    {lang === "bn"
                      ? post.category.restriction_note_bn
                      : post.category.restriction_note_en}
                  </span>
                </div>
              )}

              <p className="whitespace-pre-line text-slate-700 leading-relaxed">{post.description}</p>

              {post.donation_type === "money" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <HandCoins className="h-4 w-4" />
                    <span>
                      Target / Amount: {post.amount?.toLocaleString()} {post.currency}
                    </span>
                  </div>
                  {post.monetary_summary && (
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-emerald-800">
                      <div>
                        <span className="block text-slate-500">Pledged (Pending)</span>
                        <span className="text-sm font-bold">
                          {post.monetary_summary.pledged_total.toLocaleString()} {post.currency}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Confirmed by Both Parties</span>
                        <span className="text-sm font-bold">
                          {post.monetary_summary.confirmed_total.toLocaleString()} {post.currency}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-600">
                    Platform does not hold funds. Transfers happen directly between donor and recipient.
                  </p>
                </div>
              )}

              {/* Gated Private Details & Documents */}
              {post.can_view_private_details ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Lock className="h-4 w-4 text-emerald-700" />
                    <span>Authorized Handover & Contact Details</span>
                  </div>
                  {post.private_details?.contact_phone && (
                    <p className="text-sm text-slate-700">Phone: {post.private_details.contact_phone}</p>
                  )}
                  {post.private_details?.exact_handover_address && (
                    <p className="text-sm text-slate-700">
                      Address: {post.private_details.exact_handover_address}
                    </p>
                  )}
                  {post.private_details?.contact_note && (
                    <p className="text-sm text-slate-600">Note: {post.private_details.contact_note}</p>
                  )}
                  {post.private_documents && post.private_documents.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-slate-700">Supporting Documents:</p>
                      <ul className="mt-1 space-y-1">
                        {post.private_documents.map((doc) => (
                          <li key={doc.id}>
                            <a
                              href={doc.signed_url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {doc.file_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span>
                    Exact handover address, phone number, and supporting documents are private and unlocked only for accepted participants.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Posted by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/profiles/${post.author_id}`}
                className="block text-base font-semibold text-emerald-800 hover:underline"
              >
                {post.author?.full_name || "Community Member"}
              </Link>
              {post.author?.location_city && (
                <p className="text-xs text-slate-500">{post.author.location_city}</p>
              )}

              {user && !isOwner && (
                <Button variant="outline" className="w-full" onClick={handleMessageAuthor}>
                  <MessageSquare className="h-4 w-4" />
                  <span>{t.common.messageAuthor}</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {actionMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {actionMsg}
            </div>
          )}
          {actionErr && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {actionErr}
            </div>
          )}

          {!isOwner && post.status === "active" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {post.donation_type === "money"
                    ? "Make a Direct Monetary Pledge"
                    : post.post_type === "help_request"
                      ? "Offer to Donate"
                      : "Request This Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <Link href="/login">
                    <Button className="w-full">{t.nav.login}</Button>
                  </Link>
                ) : post.donation_type === "money" ? (
                  <form onSubmit={handlePledge} className="space-y-3">
                    <Input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      placeholder={`Amount (${post.currency})`}
                    />
                    <Textarea
                      value={pledgeNote}
                      onChange={(e) => setPledgeNote(e.target.value)}
                      placeholder="Optional note on how you will transfer directly..."
                    />
                    <Button type="submit" className="w-full">
                      <HandCoins className="h-4 w-4" />
                      <span>Record Pledge</span>
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleClaim} className="space-y-3">
                    <Textarea
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      placeholder="Write a brief message about handover timing or details..."
                    />
                    <Button type="submit" className="w-full">
                      <PackageCheck className="h-4 w-4" />
                      <span>
                        {post.post_type === "help_request" ? "Offer to Donate" : "Request Item"}
                      </span>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {user && !isOwner && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setShowReport((s) => !s)}>
                <Flag className="h-4 w-4 text-rose-600" />
                <span>{t.common.report}</span>
              </Button>
              {showReport && (
                <Card className="mt-2 p-4">
                  <form onSubmit={handleReport} className="space-y-3">
                    <Input
                      required
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Reason (e.g., Suspicious or prohibited item)"
                    />
                    <Textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Additional details..."
                    />
                    <Button type="submit" variant="destructive" size="sm" className="w-full">
                      Submit Report
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
