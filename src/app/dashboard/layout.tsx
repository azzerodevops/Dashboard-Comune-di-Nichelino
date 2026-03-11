"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Home,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ── Navigation structure ──────────────────────────────────────────────

type NavSingle = {
  type: "link";
  label: string;
  href: string;
};

type NavDropdown = {
  type: "dropdown";
  label: string;
  items: { label: string; href: string }[];
};

type NavCategory = NavSingle | NavDropdown;

const navigation: NavCategory[] = [
  { type: "link", label: "Panoramica", href: "/dashboard" },
  {
    type: "dropdown",
    label: "Emissioni & Azioni",
    items: [
      { label: "Emissioni", href: "/dashboard/emissioni" },
      { label: "Mitigazione", href: "/dashboard/mitigazione" },
      { label: "Adattamento", href: "/dashboard/adattamento" },
      { label: "Piano Azioni", href: "/dashboard/piano-azioni" },
    ],
  },
  {
    type: "dropdown",
    label: "Territorio & Clima",
    items: [
      { label: "Territorio", href: "/dashboard/territorio" },
      { label: "Clima", href: "/dashboard/clima" },
      { label: "Povert\u00e0 Energetica", href: "/dashboard/poverta-energetica" },
    ],
  },
];

// ── Check if pathname belongs to a category ───────────────────────────

function isActiveCategory(cat: NavCategory, pathname: string): boolean {
  if (cat.type === "link") {
    return cat.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(cat.href);
  }
  return cat.items.some((item) => pathname.startsWith(item.href));
}

function isActiveLink(href: string, pathname: string): boolean {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

// ── Desktop dropdown ──────────────────────────────────────────────────

function DesktopDropdown({
  cat,
  pathname,
}: {
  cat: NavDropdown;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const active = isActiveCategory(cat, pathname);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-emerald-50 text-emerald-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        {cat.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
          >
            {cat.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm transition-colors",
                  isActiveLink(item.href, pathname)
                    ? "bg-emerald-50 font-medium text-emerald-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mobile menu ───────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  pathname,
  user,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  user: { email?: string } | null;
  onLogout: () => void;
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-white"
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/stemma-nichelino.jpg"
                alt="Stemma Nichelino"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-gray-900">
                PAESC Nichelino 2030
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {navigation.map((cat) => {
              if (cat.type === "link") {
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      isActiveLink(cat.href, pathname)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {cat.label}
                  </Link>
                );
              }

              return (
                <div key={cat.label} className="mt-4">
                  <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {cat.label}
                  </p>
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base transition-colors",
                        isActiveLink(item.href, pathname)
                          ? "bg-emerald-50 font-medium text-emerald-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}

            {/* Bottom links */}
            <div className="mt-8 border-t border-gray-100 pt-6 space-y-2">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-base text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                Pagina Iniziale
              </Link>

              {user ? (
                <>
                  <Link
                    href="/monitoraggio"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-base text-emerald-700 hover:bg-emerald-50"
                  >
                    <Shield className="h-4 w-4" />
                    Area Monitoraggio
                  </Link>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-base text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-medium text-white hover:bg-emerald-700"
                >
                  Accedi
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? { email: u.email ?? undefined } : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-50 h-16 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Stemma + Title */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/stemma-nichelino.jpg"
              alt="Stemma Nichelino"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden text-sm font-semibold text-gray-900 sm:inline">
              PAESC Nichelino 2030
            </span>
          </Link>

          {/* Center: Navigation (desktop) */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((cat) => {
              if (cat.type === "link") {
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActiveLink(cat.href, pathname)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {cat.label}
                  </Link>
                );
              }
              return (
                <DesktopDropdown
                  key={cat.label}
                  cat={cat}
                  pathname={pathname}
                />
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop links */}
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                Pagina Iniziale
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/monitoraggio"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    Area Monitoraggio
                  </Link>
                  <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="max-w-[120px] truncate text-xs text-gray-600">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    Esci
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Accedi
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        user={user}
        onLogout={handleLogout}
      />

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
