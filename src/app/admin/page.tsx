"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [section, setSection] = useState<"reports" | "users" | "posts" | "actions">("reports");
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: () =>
      apiFetch<{
        stats: {
          total_users: number;
          total_posts: number;
          total_claims: number;
          total_contributions: number;
          open_reports: number;
        };
      }>("/admin/stats"),
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    enabled: isAdmin,
    queryFn: () => apiFetch<{ reports: Array<Record<string, unknown>> }>("/admin/reports"),
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: () => apiFetch<{ users: Array<Record<string, unknown>> }>("/admin/users"),
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    enabled: isAdmin,
    queryFn: () => apiFetch<{ posts: Array<Record<string, unknown>> }>("/admin/posts"),
  });

  const { data: actions } = useQuery({
    queryKey: ["admin-actions"],
    enabled: isAdmin,
    queryFn: () => apiFetch<{ actions: Array<Record<string, unknown>> }>("/admin/actions"),
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-actions"] });
  };

  if (!isLoading && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="p-8">
          <ShieldAlert className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-3 text-xl font-bold">Administrator Access Required</h1>
          <p className="mt-1 text-sm text-slate-600">This area is restricted to authorized administrators.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Admin Panel — Disputes, Bans & Moderation</h1>

      {feedback && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {feedback}
        </div>
      )}

      {stats?.stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Users", stats.stats.total_users],
            ["Posts", stats.stats.total_posts],
            ["Claims", stats.stats.total_claims],
            ["Pledges", stats.stats.total_contributions],
            ["Open Disputes", stats.stats.open_reports],
          ].map(([label, val]) => (
            <Card key={String(label)} className="p-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{String(val)}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["reports", "Disputes & Complaints"],
            ["users", "Users (Ban / Unban)"],
            ["posts", "Posts (Moderate / Delete)"],
            ["actions", "Audit Log"],
          ] as const
        ).map(([key, label]) => (
          <Button key={key} variant={section === key ? "default" : "outline"} size="sm" onClick={() => setSection(key)}>
            {label}
          </Button>
        ))}
      </div>

      {section === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle>Disputes & Complaints Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(reports?.reports ?? []).length === 0 && (
              <p className="text-sm text-slate-500">No complaints or disputes in queue.</p>
            )}
            {(reports?.reports ?? []).map((r) => {
              const id = String(r.id);
              const note = actionNote[id] || "Reviewed by administrator";
              return (
                <div key={id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "open" ? "warning" : "default"}>{String(r.status)}</Badge>
                      <Badge variant="outline">{String(r.target_type)}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">
                      {r.created_at ? new Date(String(r.created_at)).toLocaleString() : ""}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">{String(r.reason)}</p>
                  {Boolean(r.details) && <p className="text-xs text-slate-700">{String(r.details)}</p>}

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <span>Complainant: <strong>{String(r.reporter_name || "User")}</strong></span>
                    {Boolean(r.target_user_name) && (
                      <span>Against: <strong>{String(r.target_user_name)}</strong></span>
                    )}
                    {Boolean(r.target_post_title) && (
                      <span>Post: <strong>{String(r.target_post_title)}</strong></span>
                    )}
                  </div>

                  {r.status !== "resolved" && r.status !== "dismissed" && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <Input
                        value={actionNote[id] ?? ""}
                        onChange={(e) => setActionNote((prev) => ({ ...prev, [id]: e.target.value }))}
                        placeholder="Resolution note or ban reason..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await apiFetch(`/admin/reports/${id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: "resolved", reason: note }),
                            });
                            setFeedback("Dispute resolved.");
                            refreshAll();
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolve Dispute
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await apiFetch(`/admin/reports/${id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: "dismissed", reason: note }),
                            });
                            setFeedback("Complaint dismissed.");
                            refreshAll();
                          }}
                        >
                          Dismiss
                        </Button>
                        {Boolean(r.target_user_id) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await apiFetch(`/admin/users/${String(r.target_user_id)}/suspend`, {
                                method: "PATCH",
                                body: JSON.stringify({ is_suspended: true, reason: note }),
                              });
                              setFeedback("Reported user banned.");
                              refreshAll();
                            }}
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Ban User
                          </Button>
                        )}
                        {Boolean(r.target_post_id) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await apiFetch(`/admin/posts/${String(r.target_post_id)}`, {
                                method: "DELETE",
                              });
                              setFeedback("Post permanently deleted.");
                              refreshAll();
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Post
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {section === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>User Management — Ban or Unban Anyone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(users?.users ?? []).map((u) => {
              const uid = String(u.id);
              return (
                <div key={uid} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-semibold">{String(u.full_name)}</p>
                    <p className="text-xs text-slate-500">
                      Role: {String(u.role)} • Status: {u.is_suspended ? "BANNED" : "Active"}
                    </p>
                    {Boolean(u.suspended_reason) && (
                      <p className="text-xs text-rose-600">Ban reason: {String(u.suspended_reason)}</p>
                    )}
                  </div>
                  {u.role !== "admin" && (
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-48 text-xs"
                        value={actionNote[uid] ?? ""}
                        onChange={(e) => setActionNote((prev) => ({ ...prev, [uid]: e.target.value }))}
                        placeholder="Reason..."
                      />
                      <Button
                        size="sm"
                        variant={u.is_suspended ? "outline" : "destructive"}
                        onClick={async () => {
                          try {
                            await apiFetch(`/admin/users/${uid}/suspend`, {
                              method: "PATCH",
                              body: JSON.stringify({
                                is_suspended: !u.is_suspended,
                                reason: actionNote[uid] || (u.is_suspended ? "Unbanned by admin" : "Banned by admin"),
                              }),
                            });
                            setFeedback(u.is_suspended ? "User unbanned." : "User banned.");
                            refreshAll();
                          } catch (err) {
                            setFeedback(err instanceof ApiError ? err.message : "Action failed");
                          }
                        }}
                      >
                        {u.is_suspended ? "Unban" : "Ban User"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {section === "posts" && (
        <Card>
          <CardHeader>
            <CardTitle>Post Moderation — Remove, Restore, or Delete Any Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(posts?.posts ?? []).map((p) => {
              const pid = String(p.id);
              return (
                <div key={pid} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-semibold">{String(p.title)}</p>
                    <p className="text-xs text-slate-500">
                      Status: {String(p.status)} • City: {String(p.location_city || "")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status !== "removed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await apiFetch(`/admin/posts/${pid}/status`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: "removed", reason: "Hidden by administrator" }),
                          });
                          setFeedback("Post hidden.");
                          refreshAll();
                        }}
                      >
                        Hide Post
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await apiFetch(`/admin/posts/${pid}/status`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: "active", reason: "Restored by administrator" }),
                          });
                          setFeedback("Post restored.");
                          refreshAll();
                        }}
                      >
                        Restore
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await apiFetch(`/admin/posts/${pid}`, { method: "DELETE" });
                        setFeedback("Post permanently deleted.");
                        refreshAll();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Post
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {section === "actions" && (
        <Card>
          <CardHeader>
            <CardTitle>Moderation Audit Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(actions?.actions ?? []).length === 0 && (
              <p className="text-sm text-slate-500">No moderation actions recorded yet.</p>
            )}
            {(actions?.actions ?? []).map((a) => (
              <div key={String(a.id)} className="flex items-center justify-between rounded-lg border p-3 text-xs">
                <div>
                  <Badge variant="secondary">{String(a.action_type)}</Badge>
                  <span className="ml-2 text-slate-700">{String(a.reason)}</span>
                </div>
                <span className="text-slate-400">
                  {a.created_at ? new Date(String(a.created_at)).toLocaleString() : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
