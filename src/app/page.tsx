"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Armchair,
  BookOpen,
  CheckCircle2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Home,
  Laptop,
  Lock,
  MessageSquare,
  Package,
  PackageCheck,
  Pill,
  ShieldCheck,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/providers/AppProviders";
import { PostCard } from "@/components/posts/PostCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, Post } from "@/types";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  shirt: Shirt,
  "book-open": BookOpen,
  armchair: Armchair,
  laptop: Laptop,
  pill: Pill,
  home: Home,
  "graduation-cap": GraduationCap,
  "hand-coins": HandCoins,
  "heart-handshake": HeartHandshake,
  package: Package,
};

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
    <div className="bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/70 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{t.hero.subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/donations">
                <Button size="lg" className="shadow-md shadow-emerald-700/15">
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
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  {t.hero.ctaCreate}
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick-Action Feature Cards */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/create" className="group">
              <Card className="h-full border-emerald-200/70 bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Gift className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base group-hover:text-emerald-800">
                    {lang === "bn" ? "সামগ্রী দান করুন" : "Offer Items"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-slate-600">
                  {lang === "bn"
                    ? "খাবার, পোশাক, বই, আসবাব বা ইলেকট্রনিক্স সরাসরি প্রয়োজনীয় মানুষের কাছে পৌঁছে দিন।"
                    : "Share food, clothes, books, furniture, or electronics directly with neighbors in need."}
                </CardContent>
              </Card>
            </Link>

            <Link href="/requests" className="group">
              <Card className="h-full border-sky-200/70 bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base group-hover:text-sky-800">
                    {lang === "bn" ? "সহায়তার আবেদন" : "Request Support"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-slate-600">
                  {lang === "bn"
                    ? "জরুরি প্রয়োজনে পোস্ট করুন এবং দাতাদের সাথে নিরাপদে সরাসরি যোগাযোগ করুন।"
                    : "Publish urgent material or non-material help requests with protected contact details."}
                </CardContent>
              </Card>
            </Link>

            <Link href="/donations" className="group">
              <Card className="h-full border-amber-200/70 bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <HandCoins className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base group-hover:text-amber-800">
                    {lang === "bn" ? "সরাসরি আর্থিক সহায়তা" : "Direct Pledges"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-slate-600">
                  {lang === "bn"
                    ? "প্ল্যাটফর্ম কোনো টাকা ধরে না; উভয় পক্ষের নিশ্চিতকরণে সরাসরি সহায়তা।"
                    : "Record monetary pledges and confirm direct transfers with two-party verification."}
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages" className="group">
              <Card className="h-full border-violet-200/70 bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base group-hover:text-violet-800">
                    {lang === "bn" ? "নিরাপদ সরাসরি বার্তা" : "Private Coordination"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-relaxed text-slate-600">
                  {lang === "bn"
                    ? "গৃহীত অংশগ্রহণকারীদের সাথে নিরাপদে সময় ও স্থান নির্ধারণ করুন।"
                    : "Coordinate handover time and location privately once an offer is accepted."}
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Direct Handover Workflow Cards */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-2">
            {lang === "bn" ? "সহজ ৩ ধাপ" : "Simple 3-Step Flow"}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t.trust.title}
          </h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden border-slate-200/90">
            <div className="h-1.5 w-full bg-emerald-600" />
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <HandCoins className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">01</span>
              </div>
              <CardTitle>{t.trust.directMoneyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              {t.trust.directMoneyDesc}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/90">
            <div className="h-1.5 w-full bg-sky-600" />
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">02</span>
              </div>
              <CardTitle>{t.trust.directHandoverTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              {t.trust.directHandoverDesc}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/90">
            <div className="h-1.5 w-full bg-amber-500" />
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">03</span>
              </div>
              <CardTitle>{t.trust.privacyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              {t.trust.privacyDesc}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Category Cards */}
      {catData?.categories && catData.categories.length > 0 && (
        <section className="border-y border-slate-200/80 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t.feed.allCategories}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {lang === "bn"
                    ? "ক্যাটাগরি নির্বাচন করে প্রয়োজনীয় অনুদান বা আবেদন খুঁজুন"
                    : "Browse community support by category"}
                </p>
              </div>
              <Link href="/donations" className="text-sm font-medium text-emerald-700 hover:underline">
                {t.hero.ctaDonate} →
              </Link>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {catData.categories.map((cat) => {
                const Icon = categoryIcons[cat.icon] ?? Package;
                return (
                  <Link key={cat.id} href={`/donations?category=${cat.id}`} className="group">
                    <Card className="flex h-full items-center gap-3.5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {lang === "bn" ? cat.name_bn : cat.name_en}
                        </p>
                        {cat.is_restricted ? (
                          <span className="mt-0.5 inline-block text-[11px] font-medium text-amber-700">
                            {lang === "bn" ? "নিরাপত্তা শর্ত প্রযোজ্য" : "Safety guidelines apply"}
                          </span>
                        ) : (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {lang === "bn" ? "সরাসরি হস্তান্তর" : "Direct handover"}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest Community Posts */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.feed.sortLatest}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {lang === "bn"
                ? "সম্প্রদায়ের সাম্প্রতিক অনুদান ও সহায়তার আবেদনসমূহ"
                : "Recent active offers and help requests from the community"}
            </p>
          </div>
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
          <Card className="border-dashed p-10 text-center">
            <p className="text-slate-600">{t.feed.noPosts}</p>
            <Link href="/create">
              <Button className="mt-4">{t.hero.ctaCreate}</Button>
            </Link>
          </Card>
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
