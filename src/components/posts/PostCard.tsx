"use client";

import Link from "next/link";
import { MapPin, Clock, Package, Coins, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Post } from "@/types";

const urgencyVariant: Record<Post["urgency"], "secondary" | "info" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "info",
  high: "warning",
  critical: "destructive",
};

export function PostCard({ post }: { post: Post }) {
  const { lang, t } = useLanguage();
  const categoryName = lang === "bn" ? post.category?.name_bn : post.category?.name_en;
  const coverUrl = post.images?.[0]?.url;

  return (
    <Link href={`/posts/${post.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
        {coverUrl ? (
          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-emerald-700">
            {post.donation_type === "money" ? (
              <Coins className="h-9 w-9 opacity-80" />
            ) : post.donation_type === "service" ? (
              <HeartHandshake className="h-9 w-9 opacity-80" />
            ) : (
              <Package className="h-9 w-9 opacity-80" />
            )}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={post.post_type === "donation_offer" ? "default" : "info"}>
              {t.postTypes[post.post_type]}
            </Badge>
            <Badge variant={urgencyVariant[post.urgency]}>{t.urgency[post.urgency]}</Badge>
            {post.status === "fulfilled" && <Badge variant="secondary">{t.status.fulfilled}</Badge>}
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-emerald-800">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent className="mt-auto flex flex-col gap-3 pt-0">
          <p className="line-clamp-2 text-sm text-slate-600">{post.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {post.location_city}
            </span>
            {categoryName && <span className="font-medium text-slate-700">{categoryName}</span>}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              {post.author?.avatar_signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatar_signed_url}
                  alt={post.author.full_name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                  {(post.author?.full_name || "U").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate max-w-[120px]">{post.author?.full_name || "Community Member"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="text-[11px] font-medium text-emerald-700">
            {post.donation_type === "money" && post.amount
              ? `${post.amount.toLocaleString()} ${post.currency}`
              : post.quantity
                ? `${post.quantity} ${post.unit || ""}`
                : t.donationTypes[post.donation_type]}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
