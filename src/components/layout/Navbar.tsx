"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HeartHandshake,
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  LayoutDashboard,
  ShieldAlert,
  Globe,
  LogOut,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth, useLanguage } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    enabled: Boolean(user),
    refetchInterval: 30_000,
    queryFn: () => apiFetch<{ unread_count: number }>("/notifications"),
  });
  const unreadCount = notifData?.unread_count ?? 0;

  const navLinks = [
    { href: "/donations", label: t.nav.donations },
    { href: "/requests", label: t.nav.requests },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900">{t.brand}</span>
            <span className="hidden text-[11px] text-slate-500 sm:block">{t.tagline}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === "en" ? "বাংলা" : "English"}</span>
          </Button>

          {user ? (
            <>
              <Link href="/create">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4" />
                  <span>{t.nav.create}</span>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" size="icon" aria-label={t.nav.messages}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t.nav.dashboard}</span>
                  {unreadCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{t.nav.admin}</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label={t.nav.logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t.nav.register}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
          >
            {lang === "en" ? "বাং" : "EN"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/create" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                  {t.nav.create}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {t.nav.dashboard}
                </Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {t.nav.messages}
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {t.nav.admin}
                  </Link>
                )}
                <button
                  onClick={() => {
                    void logout();
                    setMobileOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t.nav.register}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
