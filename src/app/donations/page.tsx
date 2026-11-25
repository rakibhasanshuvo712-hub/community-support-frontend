"use client";

import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/components/providers/AppProviders";

export default function DonationsPage() {
  const { t } = useLanguage();
  return (
    <PostFeed
      defaultPostType="donation_offer"
      title={t.feed.donationsTitle}
      subtitle={t.feed.donationsSubtitle}
    />
  );
}
