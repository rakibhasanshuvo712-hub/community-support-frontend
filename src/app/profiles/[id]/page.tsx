"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Flag, Pencil } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Post } from "@/types";

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
  const { lang } = useLanguage();
  const [reason, setReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", id],
    queryFn: () =>
      apiFetch<{ profile: PublicProfile; public_posts?: Post[] }>(`/profiles/${id}`),
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

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-12">Loading profile...</div>;
  if (isError || !data?.profile) return <div className="mx-auto max-w-4xl px-4 py-12">Profile not found.</div>;

  const p = data.profile;
  const publicPosts = data.public_posts ?? [];
  const isOwner = user?.id === p.id;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {p.avatar_signed_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatar_signed_url}
                alt={p.full_name}
                className="h-20 w-20 rounded-full border-2 border-emerald-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 text-2xl font-bold text-emerald-800">
                {p.full_name.charAt(0).toUpperCase()}
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
              <p className="mt-1 text-xs text-slate-500">
                {lang === "bn" ? "সদস্য" : "Member since"} {new Date(p.created_at).toLocaleDateString()} •{" "}
                {lang === "bn" ? "পাবলিক পোস্ট:" : "Public posts:"} {p.public_posts_count}
              </p>
            </div>
          </div>

          {isOwner && (
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                <span>{lang === "bn" ? "প্রোফাইল ও ছবি সম্পাদনা" : "Edit Profile & Photo"}</span>
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {p.bio && <p className="text-sm text-slate-700">{p.bio}</p>}

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

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {lang === "bn" ? `${p.full_name}-এর পোস্টসমূহ` : `Posts by ${p.full_name}`}
        </h2>
        {publicPosts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            {lang === "bn" ? "এখনো কোনো পাবলিক পোস্ট নেই।" : "No public posts yet."}
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publicPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
