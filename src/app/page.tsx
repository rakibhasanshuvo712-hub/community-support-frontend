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

const categoryColorThemes = [
  "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white hover:border-emerald-400 [&_.cat-icon]:bg-emerald-100 [&_.cat-icon]:text-emerald-700 group-hover:[&_.cat-icon]:bg-emerald-600",
  "border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-400 [&_.cat-icon]:bg-sky-100 [&_.cat-icon]:text-sky-700 group-hover:[&_.cat-icon]:bg-sky-600",
  "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-400 [&_.cat-icon]:bg-amber-100 [&_.cat-icon]:text-amber-700 group-hover:[&_.cat-icon]:bg-amber-500",
  "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-white hover:border-violet-400 [&_.cat-icon]:bg-violet-100 [&_.cat-icon]:text-violet-700 group-hover:[&_.cat-icon]:bg-violet-600",
  "border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-white hover:border-rose-400 [&_.cat-icon]:bg-rose-100 [&_.cat-icon]:text-rose-700 group-hover:[&_.cat-icon]:bg-rose-600",
  "border-teal-200/80 bg-gradient-to-br from-teal-50/80 to-white hover:border-teal-400 [&_.cat-icon]:bg-teal-100 [&_.cat-icon]:text-teal-700 group-hover:[&_.cat-icon]:bg-teal-600",
];

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
      <section className="relative overflow-hidden border-b border-emerald-100/80 bg-gradient-to-br from-emerald-100/70 via-sky-50/50 to-amber-50/60">
        {/* Decorative ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {t.hero.badge}
            </span>
            <h1 className="mt-6 bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-700 sm:text-xl">{t.hero.subtitle}</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/donations">
                <Button size="lg" className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-white shadow-lg shadow-emerald-700/25 transition-transform hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700">
                  {t.hero.ctaDonate}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/requests">
                <Button size="lg" variant="outline" className="rounded-xl border-sky-300 bg-white/90 px-6 text-sky-900 backdrop-blur-xs transition-transform hover:-translate-y-0.5 hover:bg-sky-50">
                  {t.hero.ctaRequest}
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="secondary" className="rounded-xl bg-amber-100/90 px-6 text-amber-900 transition-transform hover:-translate-y-0.5 hover:bg-amber-200">
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  {t.hero.ctaCreate}
                </Button>
              </Link>
            </div>

            {/* Trust Highlights Strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-md shadow-emerald-950/5 backdrop-blur-sm sm:grid-cols-4">
              <div className="rounded-xl bg-emerald-50/80 p-2 text-center">
                <p className="text-base font-bold text-emerald-700">100%</p>
                <p className="text-[11px] font-medium text-emerald-900/70">
                  {lang === "bn" ? "সরাসরি সহায়তা" : "Direct Peer-to-Peer"}
                </p>
              </div>
              <div className="rounded-xl bg-sky-50/80 p-2 text-center">
                <p className="text-base font-bold text-sky-700">0%</p>
                <p className="text-[11px] font-medium text-sky-900/70">
                  {lang === "bn" ? "প্ল্যাটফর্ম ফি" : "Platform Commission"}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50/80 p-2 text-center">
                <p className="text-base font-bold text-amber-700">2-Party</p>
                <p className="text-[11px] font-medium text-amber-900/70">
                  {lang === "bn" ? "দ্বিপাক্ষিক নিশ্চিতকরণ" : "Verified Handover"}
                </p>
              </div>
              <div className="rounded-xl bg-violet-50/80 p-2 text-center">
                <p className="text-base font-bold text-violet-700">Private</p>
                <p className="text-[11px] font-medium text-violet-900/70">
                  {lang === "bn" ? "গোপন ঠিকানা সুরক্ষিত" : "Contacts Protected"}
                </p>
              </div>
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
              {catData.categories.map((cat, idx) => {
                const Icon = categoryIcons[cat.icon] ?? Package;
                const theme = categoryColorThemes[idx % categoryColorThemes.length];
                return (
                  <Link key={cat.id} href={`/donations?category=${cat.id}`} className="group">
                    <Card className={`flex h-full items-center gap-3.5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${theme}`}>
                      <div className="cat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:text-white">
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
