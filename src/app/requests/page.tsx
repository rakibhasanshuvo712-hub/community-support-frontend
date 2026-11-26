"use client";

import { Suspense } from "react";
import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/components/providers/AppProviders";

export default function RequestsPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">{t.feed.loading}</div>}>
      <PostFeed
        defaultPostType="help_request"
        title={t.feed.requestsTitle}
        subtitle={t.feed.requestsSubtitle}
      />
    </Suspense>
  );
}
