"use client";

import { Suspense } from "react";
import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/components/providers/AppProviders";

export default function DonationsPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">{t.feed.loading}</div>}>
      <PostFeed
        defaultPostType="donation_offer"
        title={t.feed.donationsTitle}
        subtitle={t.feed.donationsSubtitle}
      />
    </Suspense>
  );
}
