"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [section, setSection] = useState<"reports" | "users" | "posts">("reports");

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
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Admin Moderation Dashboard</h1>

      {stats?.stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Users", stats.stats.total_users],
            ["Posts", stats.stats.total_posts],
            ["Claims", stats.stats.total_claims],
            ["Pledges", stats.stats.total_contributions],
            ["Open Reports", stats.stats.open_reports],
          ].map(([label, val]) => (
            <Card key={String(label)} className="p-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{String(val)}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {(["reports", "users", "posts"] as const).map((s) => (
          <Button key={s} variant={section === s ? "default" : "outline"} size="sm" onClick={() => setSection(s)}>
            {s.toUpperCase()}
          </Button>
        ))}
      </div>

      {section === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle>Reports Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(reports?.reports ?? []).map((r) => (
              <div key={String(r.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <Badge variant="warning">{String(r.status)}</Badge>
                  <p className="mt-1 text-sm font-semibold">{String(r.reason)}</p>
                  <p className="text-xs text-slate-600">{String(r.details || "")}</p>
                </div>
                {r.status === "open" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await apiFetch(`/admin/reports/${String(r.id)}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "resolved", reason: "Reviewed by admin" }),
                        });
                        void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
                      }}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await apiFetch(`/admin/reports/${String(r.id)}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "dismissed", reason: "No violation found" }),
                        });
                        void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {section === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(users?.users ?? []).map((u) => (
              <div key={String(u.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <p className="text-sm font-semibold">{String(u.full_name)}</p>
                  <p className="text-xs text-slate-500">
                    Role: {String(u.role)} • {u.is_suspended ? "Suspended" : "Active"}
                  </p>
                </div>
                {u.role !== "admin" && (
                  <Button
                    size="sm"
                    variant={u.is_suspended ? "outline" : "destructive"}
                    onClick={async () => {
                      await apiFetch(`/admin/users/${String(u.id)}/suspend`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          is_suspended: !u.is_suspended,
                          reason: u.is_suspended ? "Account reinstated" : "Policy violation",
                        }),
                      });
                      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                    }}
                  >
                    {u.is_suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {section === "posts" && (
        <Card>
          <CardHeader>
            <CardTitle>Post Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(posts?.posts ?? []).map((p) => (
              <div key={String(p.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <p className="text-sm font-semibold">{String(p.title)}</p>
                  <p className="text-xs text-slate-500">Status: {String(p.status)}</p>
                </div>
                <div className="flex gap-2">
                  {p.status !== "removed" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await apiFetch(`/admin/posts/${String(p.id)}/status`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "removed", reason: "Moderation removal" }),
                        });
                        void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await apiFetch(`/admin/posts/${String(p.id)}/status`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "active", reason: "Restored by admin" }),
                        });
                        void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
                      }}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
