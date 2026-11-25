"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Flag, PauseCircle, Trash2, Upload } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { Claim, Contribution, NotificationItem, Post } from "@/types";

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

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("posts");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Dispute modal/inline state
  const [disputeTarget, setDisputeTarget] = useState<DisputeTarget | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");

  // Settings form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { data: myPosts } = useQuery({
    queryKey: ["my-posts"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ posts: Post[] }>("/posts/mine"),
  });

  const { data: myClaims } = useQuery({
    queryKey: ["my-claims"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ outgoing: Claim[]; incoming: Claim[] }>("/claims/mine"),
  });

  const { data: myContributions } = useQuery({
    queryKey: ["my-contributions"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ outgoing: Contribution[]; incoming: Contribution[] }>("/contributions/mine"),
  });

  const { data: myReports } = useQuery({
    queryKey: ["my-reports"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ reports: ReportItem[] }>("/reports/mine"),
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<{ notifications: NotificationItem[]; unread_count: number }>("/notifications"),
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

  const handlePostStatus = async (postId: string, status: "active" | "paused" | "fulfilled" | "closed") => {
    try {
      await apiFetch(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setFeedback(`Post marked as ${status}.`);
      void queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Failed to update post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      setFeedback("Post deleted.");
      void queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Failed to delete post");
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action: "accept" | "reject" | "cancel" | "confirm-handover"
  ) => {
    try {
      await apiFetch(`/claims/${claimId}/${action}`, { method: "PATCH" });
      setFeedback("Claim updated.");
      void queryClient.invalidateQueries({ queryKey: ["my-claims"] });
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Action failed");
    }
  };

  const handleContributionAction = async (id: string, action: "confirm" | "cancel") => {
    try {
      await apiFetch(`/contributions/${id}/${action}`, { method: "PATCH" });
      setFeedback("Contribution updated.");
      void queryClient.invalidateQueries({ queryKey: ["my-contributions"] });
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Action failed");
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTarget) return;
    try {
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
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Could not submit complaint");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Could not save settings");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await apiFetch("/profiles/me/avatar", { method: "POST", body: fd });
      await refreshUser();
      setFeedback("Avatar updated.");
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Avatar upload failed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
              <Button type="submit" variant="destructive" size="sm">
                Submit Complaint
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setDisputeTarget(null)}>
                {t.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
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
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="grid gap-4 md:grid-cols-2">
          {(myPosts?.posts ?? []).length === 0 ? (
            <Card className="p-8 text-center text-slate-500 md:col-span-2">
              You have not created any posts yet.
            </Card>
          ) : (
            (myPosts?.posts ?? []).map((p) => (
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
                      <Button size="sm" variant="outline" onClick={() => void handlePostStatus(p.id, "paused")}>
                        <PauseCircle className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => void handlePostStatus(p.id, "fulfilled")}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Fulfilled
                      </Button>
                    </>
                  )}
                  {p.status === "paused" && (
                    <Button size="sm" variant="outline" onClick={() => void handlePostStatus(p.id, "active")}>
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => void handleDeletePost(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "claims" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Received Offers & Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(myClaims?.incoming ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No incoming offers or requests.</p>
              ) : (
                (myClaims?.incoming ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{c.claimant?.full_name}</span>
                      <Badge variant="secondary">{t.status[c.status]}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{c.post?.title}</p>
                    {c.message && <p className="text-xs text-slate-700">{c.message}</p>}
                    <div className="flex flex-wrap gap-2">
                      {c.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => void handleClaimAction(c.id, "accept")}>
                            {t.common.accept}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleClaimAction(c.id, "reject")}>
                            {t.common.reject}
                          </Button>
                        </>
                      )}
                      {c.status === "accepted" && (
                        <Button size="sm" onClick={() => void handleClaimAction(c.id, "confirm-handover")}>
                          {t.common.confirmHandover}
                        </Button>
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
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Outgoing Offers & Claims</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(myClaims?.outgoing ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No outgoing offers or claims.</p>
              ) : (
                (myClaims?.outgoing ?? []).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/posts/${c.post_id}`} className="text-sm font-semibold hover:underline">
                        {c.post?.title}
                      </Link>
                      <Badge variant="secondary">{t.status[c.status]}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["pending", "accepted"].includes(c.status) && (
                        <Button size="sm" variant="outline" onClick={() => void handleClaimAction(c.id, "cancel")}>
                          {t.common.cancel}
                        </Button>
                      )}
                      {c.status === "accepted" && (
                        <Button size="sm" onClick={() => void handleClaimAction(c.id, "confirm-handover")}>
                          {t.common.confirmHandover}
                        </Button>
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
                ))
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
              {(myContributions?.incoming ?? []).map((c) => (
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
                      <Button size="sm" onClick={() => void handleContributionAction(c.id, "confirm")}>
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
              ))}
              {(myContributions?.incoming ?? []).length === 0 && (
                <p className="text-sm text-slate-500">No incoming monetary pledges.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Monetary Pledges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(myContributions?.outgoing ?? []).map((c) => (
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
                        <Button size="sm" onClick={() => void handleContributionAction(c.id, "confirm")}>
                          {t.common.confirmTransfer}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleContributionAction(c.id, "cancel")}>
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
              ))}
              {(myContributions?.outgoing ?? []).length === 0 && (
                <p className="text-sm text-slate-500">No outgoing monetary pledges.</p>
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
                  {r.target_user_name && (
                    <p className="text-xs text-slate-600">Against: {r.target_user_name}</p>
                  )}
                  {r.target_post_title && (
                    <p className="text-xs text-slate-600">Post: {r.target_post_title}</p>
                  )}
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
            {(notifData?.notifications ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              (notifData?.notifications ?? []).map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3 ${n.is_read ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/50"}`}
                >
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-slate-600">{n.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === "settings" && user && (
        <Card className="max-w-2xl">
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
              <Button type="submit">{t.common.save}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
