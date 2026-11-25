"use client";

import React, { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Flag } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PublicProfile {
  id: string;
  full_name: string;
  avatar_signed_url?: string | null;
  bio?: string | null;
  location_city?: string | null;
  location_area?: string | null;
  public_posts_count: number;
  created_at: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => apiFetch<{ profile: PublicProfile }>(`/profiles/${id}`),
  });

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({ target_type: "user", target_user_id: id, reason }),
      });
      setShowReport(false);
      setReason("");
      setMsg("User report submitted.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Failed to report user");
    }
  };

  if (isLoading) return <div className="mx-auto max-w-2xl px-4 py-12">Loading profile...</div>;
  if (isError || !data?.profile) return <div className="mx-auto max-w-2xl px-4 py-12">Profile not found.</div>;

  const p = data.profile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          {p.avatar_signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_signed_url} alt={p.full_name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">
              {p.full_name.charAt(0)}
            </div>
          )}
          <div>
            <CardTitle className="text-2xl">{p.full_name}</CardTitle>
            {p.location_city && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {p.location_city}
                {p.location_area ? `, ${p.location_area}` : ""}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {p.bio && <p className="text-sm text-slate-700">{p.bio}</p>}
          <p className="text-xs text-slate-500">
            Member since {new Date(p.created_at).toLocaleDateString()} • Public posts: {p.public_posts_count}
          </p>

          {msg && <p className="text-sm text-emerald-700">{msg}</p>}

          {user && user.id !== p.id && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setShowReport((s) => !s)}>
                <Flag className="h-4 w-4 text-rose-600" />
                <span>Report Account</span>
              </Button>
              {showReport && (
                <form onSubmit={handleReport} className="mt-2 flex gap-2">
                  <Input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason..." />
                  <Button type="submit" variant="destructive" size="sm">
                    Submit
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
