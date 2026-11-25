"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/providers/AppProviders";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Post } from "@/types";

interface PostFeedProps {
  defaultPostType?: "donation_offer" | "help_request";
  title: string;
  subtitle: string;
}

export function PostFeed({ defaultPostType, title, subtitle }: PostFeedProps) {
  const { lang, t } = useLanguage();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [donationType, setDonationType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [sort, setSort] = useState<"latest" | "urgent" | "relevant">("latest");
  const [page, setPage] = useState(1);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ categories: Category[] }>("/categories"),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", defaultPostType, q, city, categoryId, donationType, urgency, sort, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (defaultPostType) params.set("post_type", defaultPostType);
      if (q.trim()) params.set("q", q.trim());
      if (city.trim()) params.set("city", city.trim());
      if (categoryId) params.set("category_id", categoryId);
      if (donationType) params.set("donation_type", donationType);
      if (urgency) params.set("urgency", urgency);
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "12");
      return apiFetch<{
        posts: Post[];
        pagination: { page: number; total_pages: number; total: number };
      }>(`/posts?${params.toString()}`);
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-slate-600">{subtitle}</p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={t.feed.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <Input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          placeholder={t.feed.cityPlaceholder}
        />

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800"
        >
          <option value="">{t.feed.allCategories}</option>
          {(catData?.categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {lang === "bn" ? cat.name_bn : cat.name_en}
            </option>
          ))}
        </select>

        <select
          value={donationType}
          onChange={(e) => {
            setDonationType(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800"
        >
          <option value="">{t.feed.allTypes}</option>
          <option value="item">{t.donationTypes.item}</option>
          <option value="money">{t.donationTypes.money}</option>
          <option value="service">{t.donationTypes.service}</option>
        </select>

        <div className="flex gap-2">
          <select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              setPage(1);
            }}
            className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800"
          >
            <option value="">{t.feed.allUrgency}</option>
            <option value="critical">{t.urgency.critical}</option>
            <option value="high">{t.urgency.high}</option>
            <option value="medium">{t.urgency.medium}</option>
            <option value="low">{t.urgency.low}</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "latest" | "urgent" | "relevant")}
            className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800"
          >
            <option value="latest">{t.feed.sortLatest}</option>
            <option value="urgent">{t.feed.sortUrgent}</option>
            <option value="relevant">{t.feed.sortRelevant}</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          {t.feed.error}
        </div>
      ) : !data?.posts || data.posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          {t.feed.noPosts}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {data.pagination.total_pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t.feed.prev}
              </Button>
              <span className="text-sm text-slate-600">
                {page} / {data.pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t.feed.next}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
