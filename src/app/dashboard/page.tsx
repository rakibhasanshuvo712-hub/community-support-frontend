"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Flag, PauseCircle, Phone, Trash2, Upload } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Category, Claim, Contribution, NotificationItem, Post } from "@/types";

type Tab = "posts" | "claims" | "contributions" | "disputes" | "notifications" | "settings";

interface DisputeTarget {
  targetUserId: string;
  targetName: string;
  postId: string;
  claimId?: string;
  contributionId?: string;
}

interface ReportItem {
  id: string;
  target_type: string;
  target_user_name?: string | null;
  target_post_title?: string | null;
  reason: string;
  details?: string | null;
  status: string;
  resolution_note?: string | null;
  created_at: string;
}

interface ApplinkStatus {
  features_enabled: boolean;
  otp_enabled: boolean;
  delivery_reports_enabled: boolean;
  sms_transport_mode: "mock" | "live" | "disabled";
  otp_transport_mode: "mock" | "live" | "disabled";
  binding: {
    masked_msisdn: string;
    subscription_status: string;
    binding_mode: "mock" | "live";
    consented_at: string;
    last_confirmed_at: string | null;
  } | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<Tab>("posts");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  // My Posts filters
  const [postTypeFilter, setPostTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Dispute state
  const [disputeTarget, setDisputeTarget] = useState<DisputeTarget | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");

  // Settings form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Optional Applink OTP binding state
  const [otpPhone, setOtpPhone] = useState("");
  const [otpConsent, setOtpConsent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpChallengeActive, setOtpChallengeActive] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ categories: Category[] }>("/categories"),
  });

  const {
    data: myPosts,
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: ["my-posts"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ posts: Post[] }>("/posts/mine"),
  });

  const {
    data: myClaims,
    isLoading: claimsLoading,
    isError: claimsError,
  } = useQuery({
    queryKey: ["my-claims"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ outgoing: Claim[]; incoming: Claim[] }>("/claims/mine"),
  });

  const {
    data: myContributions,
    isLoading: contribsLoading,
    isError: contribsError,
  } = useQuery({
    queryKey: ["my-contributions"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ outgoing: Contribution[]; incoming: Contribution[] }>("/contributions/mine"),
  });

  const { data: myReports } = useQuery({
    queryKey: ["my-reports"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ reports: ReportItem[] }>("/reports/mine"),
  });

  const {
    data: notifData,
    isLoading: notifsLoading,
    isError: notifsError,
  } = useQuery({
    queryKey: ["notifications"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ notifications: NotificationItem[]; unread_count: number }>("/notifications"),
  });

  const { data: applinkStatus } = useQuery({
    queryKey: ["applink-status"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<ApplinkStatus>("/applink/status"),
  });

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="p-8">
          <p className="text-slate-600">Please sign in to access your dashboard.</p>
          <Link href="/login">
            <Button className="mt-4">{t.nav.login}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const runAction = async (actionId: string, fn: () => Promise<void>) => {
    if (pendingActionId) return;
    setPendingActionId(actionId);
    setFeedback(null);
    setErrorMsg(null);
    try {
      await fn();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setPendingActionId(null);
    }
  };

  const handlePostStatus = (postId: string, status: "active" | "paused" | "fulfilled" | "closed") =>
    runAction(`post-${postId}`, async () => {
      await apiFetch(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setFeedback(`Post marked as ${status}.`);
      void queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    });

  const handleDeletePost = (postId: string) =>
    runAction(`del-${postId}`, async () => {
      await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      setFeedback("Post deleted.");
      void queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    });

  const handleClaimAction = (
    claimId: string,
    action: "accept" | "reject" | "cancel" | "confirm-handover"
  ) =>
    runAction(`claim-${claimId}-${action}`, async () => {
      await apiFetch(`/claims/${claimId}/${action}`, { method: "PATCH" });
      setFeedback(
        action === "accept"
          ? "Request accepted! Coordinate directly with the participant."
          : action === "confirm-handover"
            ? "Handover confirmation recorded."
            : "Claim updated."
      );
      void queryClient.invalidateQueries({ queryKey: ["my-claims"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

  const handleContributionAction = (id: string, action: "confirm" | "cancel") =>
    runAction(`contrib-${id}-${action}`, async () => {
      await apiFetch(`/contributions/${id}/${action}`, { method: "PATCH" });
      setFeedback("Contribution updated.");
      void queryClient.invalidateQueries({ queryKey: ["my-contributions"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTarget) return;
    await runAction("dispute-submit", async () => {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          target_type: "dispute",
          target_user_id: disputeTarget.targetUserId,
          target_post_id: disputeTarget.postId,
          claim_id: disputeTarget.claimId ?? null,
          contribution_id: disputeTarget.contributionId ?? null,
          reason: disputeReason,
          details: disputeDetails,
        }),
      });
      setDisputeTarget(null);
      setDisputeReason("");
      setDisputeDetails("");
      setFeedback("Complaint submitted. An administrator will review this dispute.");
      void queryClient.invalidateQueries({ queryKey: ["my-reports"] });
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAction("save-settings", async () => {
      await apiFetch("/profiles/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName || user?.full_name,
          bio: bio || user?.bio,
          location_city: city || user?.location_city,
          phone: phone || user?.contacts?.phone,
          exact_address: address || user?.contacts?.exact_address,
        }),
      });
      await refreshUser();
      setFeedback("Profile settings saved.");
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await runAction("avatar-upload", async () => {
      await apiFetch("/profiles/me/avatar", { method: "POST", body: fd });
      await refreshUser();
      setFeedback("Avatar updated.");
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAction("otp-request", async () => {
      const consentWording =
        "I consent to receive Sahayata claim-acceptance SMS alerts on this Banglalink number. I understand live subscription/charging rules apply only after operator approval.";
      const res = await apiFetch<{ demo_mode: boolean; masked_msisdn: string }>(
        "/applink/binding/otp/request",
        {
          method: "POST",
          body: JSON.stringify({
            phone: otpPhone,
            consent: otpConsent,
            consent_wording: consentWording,
          }),
        }
      );
      setOtpChallengeActive(true);
      setFeedback(
        res.demo_mode
          ? `Demo mode — no real SMS sent. Simulated OTP challenge created for ${res.masked_msisdn}.`
          : `OTP sent to ${res.masked_msisdn}.`
      );
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAction("otp-verify", async () => {
      const res = await apiFetch<{ demo_mode: boolean; subscription_status: string }>(
        "/applink/binding/otp/verify",
        {
          method: "POST",
          body: JSON.stringify({ otp: otpCode }),
        }
      );
      setOtpChallengeActive(false);
      setOtpCode("");
      void queryClient.invalidateQueries({ queryKey: ["applink-status"] });
      setFeedback(
        res.demo_mode
          ? `Demo mode — no real SMS sent. Mock binding verified (${res.subscription_status}).`
          : `Phone verified (${res.subscription_status}).`
      );
    });
  };

  const handleOptOutSms = () =>
    runAction("otp-opt-out", async () => {
      await apiFetch("/applink/binding/opt-out", { method: "POST" });
      void queryClient.invalidateQueries({ queryKey: ["applink-status"] });
      setFeedback("Unsubscribed from SMS notifications.");
    });

  const filteredPosts = (myPosts?.posts ?? []).filter((p) => {
    if (postTypeFilter && p.post_type !== postTypeFilter) return false;
    if (categoryFilter && p.category_id !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-600">{user?.full_name}</p>
        </div>
        <Link href="/create">
          <Button>{t.nav.create}</Button>
        </Link>
      </div>

      {feedback && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {feedback}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {disputeTarget && (
        <Card className="mb-6 border-rose-200 bg-rose-50/40 p-5">
          <h2 className="text-base font-bold text-slate-900">
            File a Complaint / Dispute against {disputeTarget.targetName}
          </h2>
          <form onSubmit={handleSubmitDispute} className="mt-3 space-y-3">
            <Input
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Reason (e.g., No-show at handover, unconfirmed transfer, misleading item)"
            />
            <Textarea
              value={disputeDetails}
              onChange={(e) => setDisputeDetails(e.target.value)}
              placeholder="Describe what happened so an administrator can resolve this dispute..."
            />
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" size="sm" disabled={pendingActionId === "dispute-submit"}>
                {pendingActionId === "dispute-submit" ? "Submitting..." : "Submit Complaint"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setDisputeTarget(null)}>
                {t.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Mobile-friendly scrollable Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
        {(
          [
            ["posts", t.dashboard.myPosts],
            ["claims", t.dashboard.myClaims],
            ["contributions", t.dashboard.myContributions],
            ["disputes", `Complaints (${myReports?.reports.length ?? 0})`],
            ["notifications", `${t.dashboard.notifications} (${notifData?.unread_count ?? 0})`],
            ["settings", t.dashboard.settings],
          ] as Array<[Tab, string]>
        ).map(([key, label]) => (
          <Button
            key={key}
            variant={tab === key ? "default" : "ghost"}
            size="sm"
            className="shrink-0"
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={postTypeFilter}
              onChange={(e) => setPostTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">All Post Types</option>
              <option value="donation_offer">{t.postTypes.donation_offer}</option>
              <option value="help_request">{t.postTypes.help_request}</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">{t.feed.allCategories}</option>
              {(catData?.categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {lang === "bn" ? cat.name_bn : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {postsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
              ))}
            </div>
          ) : postsError ? (
            <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              Could not load your posts.
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No posts match your filter yet.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPosts.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge>{t.postTypes[p.post_type]}</Badge>
                      <Badge variant="secondary">{t.status[p.status]}</Badge>
                    </div>
                    <Link href={`/posts/${p.id}`} className="mt-2 font-semibold hover:text-emerald-700">
                      {p.title}
                    </Link>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-2">
                    {p.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingActionId === `post-${p.id}`}
                          onClick={() => void handlePostStatus(p.id, "paused")}
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pendingActionId === `post-${p.id}`}
                          onClick={() => void handlePostStatus(p.id, "fulfilled")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Fulfilled
                        </Button>
                      </>
                    )}
                    {p.status === "paused" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingActionId === `post-${p.id}`}
                        onClick={() => void handlePostStatus(p.id, "active")}
                      >
                        Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={pendingActionId === `del-${p.id}`}
                      onClick={() => void handleDeletePost(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "claims" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incoming Requests & Offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claimsLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : claimsError ? (
                <p className="text-sm text-rose-600">Failed to load incoming requests.</p>
              ) : (myClaims?.incoming ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No incoming offers or requests.</p>
              ) : (
                (myClaims?.incoming ?? []).map((c) => {
                  const ownerIsDonor = c.post?.post_type === "donation_offer";
                  const iConfirmed = ownerIsDonor
                    ? c.donor_confirmed_handover
                    : c.recipient_confirmed_handover;
                  return (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{c.claimant?.full_name}</span>
                        <Badge variant={c.status === "completed" ? "default" : "secondary"}>
                          {t.status[c.status]}
                        </Badge>
                      </div>
                      <Link href={`/posts/${c.post_id}`} className="block text-xs font-medium text-emerald-800 hover:underline">
                        {c.post?.title}
                      </Link>
                      {c.message && <p className="text-xs text-slate-700">{c.message}</p>}
                      <div className="flex flex-wrap gap-2">
                        {c.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              disabled={pendingActionId === `claim-${c.id}-accept`}
                              onClick={() => void handleClaimAction(c.id, "accept")}
                            >
                              {pendingActionId === `claim-${c.id}-accept` ? "Accepting..." : t.common.accept}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pendingActionId === `claim-${c.id}-reject`}
                              onClick={() => void handleClaimAction(c.id, "reject")}
                            >
                              {t.common.reject}
                            </Button>
                          </>
                        )}
                        {c.status === "accepted" && !iConfirmed && (
                          <Button
                            size="sm"
                            disabled={pendingActionId === `claim-${c.id}-confirm-handover`}
                            onClick={() => void handleClaimAction(c.id, "confirm-handover")}
                          >
                            {t.common.confirmHandover}
                          </Button>
                        )}
                        {c.status === "accepted" && iConfirmed && (
                          <Badge variant="info">You confirmed — awaiting other party</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setDisputeTarget({
                              targetUserId: c.claimant_id,
                              targetName: c.claimant?.full_name || "Participant",
                              postId: c.post_id,
                              claimId: c.id,
                            })
                          }
                        >
                          <Flag className="h-3.5 w-3.5 text-rose-600" />
                          Complain
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Requests & Offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claimsLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : claimsError ? (
                <p className="text-sm text-rose-600">Failed to load your requests.</p>
              ) : (myClaims?.outgoing ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No outgoing offers or claims.</p>
              ) : (
                (myClaims?.outgoing ?? []).map((c) => {
                  const claimantIsDonor = c.post?.post_type === "help_request";
                  const iConfirmed = claimantIsDonor
                    ? c.donor_confirmed_handover
                    : c.recipient_confirmed_handover;
                  return (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/posts/${c.post_id}`} className="text-sm font-semibold hover:underline">
                          {c.post?.title}
                        </Link>
                        <Badge variant={c.status === "completed" ? "default" : "secondary"}>
                          {t.status[c.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["pending", "accepted"].includes(c.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pendingActionId === `claim-${c.id}-cancel`}
                            onClick={() => void handleClaimAction(c.id, "cancel")}
                          >
                            {t.common.cancel}
                          </Button>
                        )}
                        {c.status === "accepted" && !iConfirmed && (
                          <Button
                            size="sm"
                            disabled={pendingActionId === `claim-${c.id}-confirm-handover`}
                            onClick={() => void handleClaimAction(c.id, "confirm-handover")}
                          >
                            {t.common.confirmHandover}
                          </Button>
                        )}
                        {c.status === "accepted" && iConfirmed && (
                          <Badge variant="info">You confirmed — awaiting other party</Badge>
                        )}
                        {c.post?.author_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDisputeTarget({
                                targetUserId: c.post!.author_id,
                                targetName: c.post?.author?.full_name || "Post Owner",
                                postId: c.post_id,
                                claimId: c.id,
                              })
                            }
                          >
                            <Flag className="h-3.5 w-3.5 text-rose-600" />
                            Complain
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "contributions" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pledges Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contribsLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : contribsError ? (
                <p className="text-sm text-rose-600">Failed to load pledges.</p>
              ) : (myContributions?.incoming ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No incoming monetary pledges.</p>
              ) : (
                (myContributions?.incoming ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {c.amount} {c.currency} — {c.contributor?.full_name}
                      </span>
                      <Badge variant={c.status === "confirmed" ? "default" : "warning"}>
                        {t.status[c.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {c.status === "pledged" && (
                        <Button
                          size="sm"
                          disabled={pendingActionId === `contrib-${c.id}-confirm`}
                          onClick={() => void handleContributionAction(c.id, "confirm")}
                        >
                          {t.common.confirmTransfer}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDisputeTarget({
                            targetUserId: c.contributor_id,
                            targetName: c.contributor?.full_name || "Donor",
                            postId: c.post_id,
                            contributionId: c.id,
                          })
                        }
                      >
                        <Flag className="h-3.5 w-3.5 text-rose-600" />
                        Complain
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Monetary Pledges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contribsLoading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : contribsError ? (
                <p className="text-sm text-rose-600">Failed to load your pledges.</p>
              ) : (myContributions?.outgoing ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No outgoing monetary pledges.</p>
              ) : (
                (myContributions?.outgoing ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {c.amount} {c.currency}
                      </span>
                      <Badge variant={c.status === "confirmed" ? "default" : "warning"}>
                        {t.status[c.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{c.post?.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.status === "pledged" && (
                        <>
                          <Button
                            size="sm"
                            disabled={pendingActionId === `contrib-${c.id}-confirm`}
                            onClick={() => void handleContributionAction(c.id, "confirm")}
                          >
                            {t.common.confirmTransfer}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pendingActionId === `contrib-${c.id}-cancel`}
                            onClick={() => void handleContributionAction(c.id, "cancel")}
                          >
                            {t.common.cancel}
                          </Button>
                        </>
                      )}
                      {c.post?.author_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setDisputeTarget({
                              targetUserId: c.post!.author_id,
                              targetName: c.post?.author?.full_name || "Recipient",
                              postId: c.post_id,
                              contributionId: c.id,
                            })
                          }
                        >
                          <Flag className="h-3.5 w-3.5 text-rose-600" />
                          Complain
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "disputes" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Complaints & Disputes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(myReports?.reports ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">You have not filed any complaints or disputes.</p>
            ) : (
              (myReports?.reports ?? []).map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.reason}</span>
                    <Badge variant={r.status === "resolved" ? "default" : "warning"}>{r.status}</Badge>
                  </div>
                  {r.target_user_name && <p className="text-xs text-slate-600">Against: {r.target_user_name}</p>}
                  {r.target_post_title && <p className="text-xs text-slate-600">Post: {r.target_post_title}</p>}
                  {r.details && <p className="text-xs text-slate-700">{r.details}</p>}
                  {r.resolution_note && (
                    <p className="mt-1 rounded bg-slate-50 p-2 text-xs text-emerald-800">
                      Admin resolution: {r.resolution_note}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === "notifications" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              <span>{t.dashboard.notifications}</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await apiFetch("/notifications/read-all", { method: "PATCH" });
                void queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }}
            >
              Mark all read
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifsLoading ? (
              <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ) : notifsError ? (
              <p className="text-sm text-rose-600">Failed to load notifications.</p>
            ) : (notifData?.notifications ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              (notifData?.notifications ?? []).map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "/dashboard"}
                  onClick={() => {
                    if (!n.is_read) {
                      void apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" }).then(() =>
                        queryClient.invalidateQueries({ queryKey: ["notifications"] })
                      );
                    }
                  }}
                  className={`block rounded-xl border p-3 transition-colors hover:border-emerald-300 ${
                    n.is_read ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.is_read && <Badge>New</Badge>}
                  </div>
                  <p className="text-xs text-slate-600">{n.body}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === "settings" && user && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.settings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                {user.avatar_signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_signed_url}
                    alt={user.full_name}
                    className="h-16 w-16 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                    {user.full_name.charAt(0)}
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Profile Photo
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t.auth.fullName}</label>
                  <Input defaultValue={user.full_name} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Bio</label>
                  <Textarea defaultValue={user.bio || ""} onChange={(e) => setBio(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <Input defaultValue={user.location_city || ""} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Private Phone</label>
                    <Input defaultValue={user.contacts?.phone || ""} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Private Address</label>
                  <Input defaultValue={user.contacts?.exact_address || ""} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button type="submit" disabled={pendingActionId === "save-settings"}>
                  {pendingActionId === "save-settings" ? "Saving..." : t.common.save}
                </Button>
              </form>
            </CardContent>
          </Card>

          {applinkStatus?.features_enabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-4 w-4 text-emerald-700" />
                    <span>Banglalink SMS Alerts (Applink)</span>
                  </CardTitle>
                  {(applinkStatus.sms_transport_mode === "mock" ||
                    applinkStatus.otp_transport_mode === "mock") && (
                    <Badge variant="warning">Demo mode — no real SMS sent</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {applinkStatus.binding && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                    <p>
                      Bound Number: <strong>{applinkStatus.binding.masked_msisdn}</strong>
                    </p>
                    <p>
                      Status: <Badge variant="secondary">{applinkStatus.binding.subscription_status}</Badge>{" "}
                      ({applinkStatus.binding.binding_mode})
                    </p>
                    {["REGISTERED", "TRIAL"].includes(applinkStatus.binding.subscription_status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        disabled={pendingActionId === "otp-opt-out"}
                        onClick={handleOptOutSms}
                      >
                        Opt Out of SMS Alerts
                      </Button>
                    )}
                  </div>
                )}

                {applinkStatus.otp_enabled ? (
                  !otpChallengeActive ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium">Banglalink Number</label>
                        <Input
                          required
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          placeholder="019XXXXXXXX"
                        />
                      </div>
                      <label className="flex items-start gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={otpConsent}
                          onChange={(e) => setOtpConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4"
                        />
                        <span>
                          I consent to receive claim-acceptance SMS alerts via Applink. Live subscription/charging terms apply only after operator approval.
                        </span>
                      </label>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!otpConsent || pendingActionId === "otp-request"}
                      >
                        {pendingActionId === "otp-request" ? "Sending..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <Input
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter OTP code"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={pendingActionId === "otp-verify"}>
                          {pendingActionId === "otp-verify" ? "Verifying..." : "Verify & Bind"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setOtpChallengeActive(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )
                ) : (
                  <p className="text-xs text-slate-500">
                    Live OTP subscription activation is currently disabled pending Applink approval.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
