"use client";

import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/components/providers/AppProviders";

export default function RequestsPage() {
  const { t } = useLanguage();
  return (
    <PostFeed
      defaultPostType="help_request"
      title={t.feed.requestsTitle}
      subtitle={t.feed.requestsSubtitle}
    />
  );
}
