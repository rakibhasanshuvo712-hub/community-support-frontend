"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, HandCoins, PackageCheck, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/providers/AppProviders";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, Post } from "@/types";

export default function HomePage() {
  const { lang, t } = useLanguage();

  const { data: latestData, isLoading } = useQuery({
    queryKey: ["posts", "home-latest"],
    queryFn: () => apiFetch<{ posts: Post[] }>("/posts?limit=6&sort=latest"),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ categories: Category[] }>("/categories"),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-emerald-50/80 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{t.hero.subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/donations">
                <Button size="lg">
                  {t.hero.ctaDonate}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/requests">
                <Button size="lg" variant="outline">
                  {t.hero.ctaRequest}
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="secondary">
                  {t.hero.ctaCreate}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Trust Rules */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          {t.trust.title}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <HandCoins className="h-5 w-5" />
              </div>
              <CardTitle>{t.trust.directMoneyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{t.trust.directMoneyDesc}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <PackageCheck className="h-5 w-5" />
              </div>
              <CardTitle>{t.trust.directHandoverTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{t.trust.directHandoverDesc}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle>{t.trust.privacyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{t.trust.privacyDesc}</CardContent>
          </Card>
        </div>
      </section>

      {/* Categories */}
      {catData?.categories && catData.categories.length > 0 && (
        <section className="border-y border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-900">{t.feed.allCategories}</h2>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {catData.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/donations`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {lang === "bn" ? cat.name_bn : cat.name_en}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Community Posts */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{t.feed.sortLatest}</h2>
          <Link href="/donations" className="text-sm font-medium text-emerald-700 hover:underline">
            {t.common.viewDetails} →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : !latestData?.posts || latestData.posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            {t.feed.noPosts}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestData.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
