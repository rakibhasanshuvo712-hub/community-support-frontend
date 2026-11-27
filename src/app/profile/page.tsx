"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ExternalLink, MapPin, Phone, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import type { UserProfile } from "@/types";

function ProfileEditor({
  user,
  refreshUser,
  lang,
}: {
  user: UserProfile;
  refreshUser: () => Promise<void>;
  lang: "en" | "bn";
}) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [city, setCity] = useState(user.location_city || "");
  const [area, setArea] = useState(user.location_area || "");
  const [phone, setPhone] = useState(user.contacts?.phone || "");
  const [exactAddress, setExactAddress] = useState(user.contacts?.exact_address || "");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "bn">(
    user.preferred_language === "bn" ? "bn" : "en"
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);
    setErrorMsg(null);
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await apiFetch("/profiles/me/avatar", { method: "POST", body: fd });
      await refreshUser();
      setFeedback(lang === "bn" ? "প্রোফাইল ছবি আপডেট হয়েছে।" : "Profile picture updated.");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    setSaving(true);
    try {
      await apiFetch("/profiles/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName.trim(),
          bio: bio.trim() || null,
          location_city: city.trim() || null,
          location_area: area.trim() || null,
          phone: phone.trim() || null,
          exact_address: exactAddress.trim() || null,
          preferred_language: preferredLanguage,
        }),
      });
      await refreshUser();
      setFeedback(lang === "bn" ? "প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।" : "Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-5 pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar_signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_signed_url}
                  alt={user.full_name}
                  className="h-20 w-20 rounded-full border-2 border-emerald-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 text-2xl font-bold text-emerald-800">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                title={lang === "bn" ? "ছবি পরিবর্তন করুন" : "Change profile picture"}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white bg-emerald-700 text-white shadow hover:bg-emerald-800"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {user.location_city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location_city}
                    {user.location_area ? `, ${user.location_area}` : ""}
                  </span>
                )}
                {user.contacts?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {user.contacts.phone}
                  </span>
                )}
                <span>
                  {lang === "bn" ? "সদস্য" : "Member since"} {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              {user.bio && <p className="mt-2 max-w-md text-sm text-slate-600">{user.bio}</p>}
            </div>
          </div>

          <Link href={`/profiles/${user.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              <span>{lang === "bn" ? "পাবলিক প্রোফাইল দেখুন" : "View Public Profile"}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "bn" ? "প্রোফাইল সম্পাদনা করুন" : "Edit Profile & Photo"}</CardTitle>
          <p className="text-sm text-slate-500">
            {lang === "bn"
              ? "আপনার পাবলিক নাম, ছবি, বায়ো ও অবস্থান আপডেট করুন। ঠিকানা ও ফোন নম্বর গোপন থাকে।"
              : "Update your display name, profile photo, bio, and city. Private phone and address remain hidden until a claim is accepted."}
          </p>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {feedback}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-xs hover:bg-emerald-50">
              <Camera className="h-4 w-4" />
              <span>
                {uploadingAvatar
                  ? lang === "bn"
                    ? "আপলোড হচ্ছে..."
                    : "Uploading..."
                  : lang === "bn"
                    ? "নতুন প্রোফাইল ছবি আপলোড করুন"
                    : "Upload Profile Picture"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={handleAvatarUpload}
              />
            </label>
            <span className="text-xs text-slate-500">JPEG, PNG or WebP (max 2MB)</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "পূর্ণ নাম" : "Full Name"}
                </label>
                <Input required minLength={2} maxLength={120} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "পছন্দের ভাষা" : "Preferred Language"}
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value === "bn" ? "bn" : "en")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bangla)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {lang === "bn" ? "পরিচিতি / বায়ো" : "Bio"}
              </label>
              <Textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "আপনার সম্পর্কে বা আপনি কীভাবে কমিউনিটিকে সহায়তা করতে চান লিখুন..."
                    : "Tell the community a bit about yourself or how you'd like to help..."
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "শহর / জেলা" : "City / District"}
                </label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {lang === "bn" ? "এলাকা" : "Area / Neighborhood"}
                </label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Dhanmondi" />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>{lang === "bn" ? "গোপন যোগাযোগের তথ্য" : "Private Contact Details"}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {lang === "bn" ? "ফোন নম্বর" : "Phone Number"}
                  </label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+88017..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    {lang === "bn" ? "ঠিকানা (গোপন)" : "Exact Handover Address (Private)"}
                  </label>
                  <Input value={exactAddress} onChange={(e) => setExactAddress(e.target.value)} placeholder="House / Road details" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                <span>
                  {saving
                    ? lang === "bn"
                      ? "সংরক্ষণ হচ্ছে..."
                      : "Saving..."
                    : lang === "bn"
                      ? "পরিবর্তন সংরক্ষণ করুন"
                      : "Save Profile"}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();
  const { lang } = useLanguage();

  if (!isLoading && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card className="p-8">
          <UserIcon className="mx-auto h-10 w-10 text-emerald-700" />
          <h1 className="mt-3 text-xl font-bold">
            {lang === "bn" ? "আপনার প্রোফাইল দেখতে লগইন করুন" : "Sign in to view your profile"}
          </h1>
          <Button className="mt-5" onClick={() => router.push("/login")}>
            {lang === "bn" ? "লগইন" : "Sign In"}
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-sm text-slate-500">Loading profile...</div>;
  }

  return <ProfileEditor key={user.id} user={user} refreshUser={refreshUser} lang={lang} />;
}
