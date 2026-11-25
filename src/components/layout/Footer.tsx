"use client";

import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/providers/AppProviders";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-emerald-700" />
              <span className="text-base font-bold text-slate-900">{t.brand}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{t.trust.directMoneyDesc}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{t.nav.donations}</span>
            <Link href="/donations" className="hover:text-emerald-700">{t.nav.donations}</Link>
            <Link href="/requests" className="hover:text-emerald-700">{t.nav.requests}</Link>
            <Link href="/create" className="hover:text-emerald-700">{t.nav.create}</Link>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{t.nav.about}</span>
            <Link href="/about" className="hover:text-emerald-700">{t.nav.about}</Link>
            <Link href="/contact" className="hover:text-emerald-700">{t.nav.contact}</Link>
            <Link href="/privacy" className="hover:text-emerald-700">{t.nav.privacy}</Link>
            <Link href="/terms" className="hover:text-emerald-700">{t.nav.terms}</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Direct peer-to-peer coordination. Never share card numbers, CVV, PIN, or OTP.</span>
          </div>
          <span>© {new Date().getFullYear()} {t.brand}</span>
        </div>
      </div>
    </footer>
  );
}
