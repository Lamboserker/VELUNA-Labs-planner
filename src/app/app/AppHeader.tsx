'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/assets/veluna-labs-logo.png';

const navItems: Array<{ label: string; href: Route }> = [
  { label: 'Eingang', href: '/app/inbox' },
  { label: 'Planung', href: '/app/plan' },
  { label: 'Aufgaben', href: '/app/projects' },
  { label: 'Analysen', href: '/app/analytics' },
  { label: 'Projekte', href: '/app/projects' },
  { label: 'Profil', href: '/app/profile' },
];

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function AppHeader() {
  const today = dateFormatter.format(new Date());
  const pathname = usePathname() ?? '/app/plan';
  const loginRoute = '/auth/login' as Route;
  const registerRoute = '/auth/register' as Route;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderNavLinks = (className: string, onItemClick?: () => void) => (
    <ul className={className}>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              prefetch={false}
              onClick={onItemClick}
              className={`transition ${isActive ? 'text-white' : 'text-slate-400'} ${
                isActive
                  ? "after:content-[''] after:block after:h-0.5 after:w-full after:bg-cyan-400 after:-mt-1"
                  : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/40 bg-slate-950/80 shadow-[0_15px_30px_rgba(15,23,42,0.6)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.6)]">
              <Image
                src={Logo}
                alt="Veluna Labs Logo"
                width={36}
                height={36}
                style={{ height: 'auto' }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-slate-400">
                Veluna-Labs-Planer
              </p>
              <p className="text-sm font-semibold text-white">Klarheit in jedem Fokus</p>
            </div>
          </div>

          <div className="hidden md:block">
            {renderNavLinks('flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400')}
          </div>

          <div className="hidden md:flex md:items-center md:gap-4 text-[0.55rem] font-semibold uppercase tracking-[0.35em]">
            <Link
              href="/app/inbox"
              prefetch={false}
              className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-5 py-2 text-white shadow-[0_20px_40px_rgba(59,130,246,0.45)]"
            >
              Neu
            </Link>
            <div className="rounded-full border border-slate-700 px-4 py-2 text-xs tracking-[0.15em] text-slate-400">
              {today}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs tracking-[0.1em] text-white">
              <SignedOut>
                <div className="flex items-center gap-2">
                  <Link
                    href={loginRoute}
                    prefetch={false}
                    className="text-xs uppercase tracking-[0.3em] text-slate-200"
                  >
                    Einloggen
                  </Link>
                  <span className="text-slate-400">/</span>
                  <Link
                    href={registerRoute}
                    prefetch={false}
                    className="text-xs uppercase tracking-[0.3em] text-slate-200"
                  >
                    Registrieren
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl={loginRoute} />
              </SignedIn>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-300">
              {today}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-white shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
            >
              <span className="sr-only">Navigation öffnen oder schließen</span>
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className={`${isMobileNavOpen ? 'block' : 'hidden'} pb-4 md:hidden`}>
          <div className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-950/90 px-4 py-5 shadow-[0_15px_30px_rgba(15,23,42,0.55)]">
            {renderNavLinks(
              'grid grid-cols-2 gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-slate-200',
              () => setIsMobileNavOpen(false)
            )}

            <div className="grid gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.22em]">
              <Link
                href="/app/inbox"
                prefetch={false}
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-4 py-3 text-white shadow-[0_20px_40px_rgba(59,130,246,0.35)]"
              >
                Neu anlegen
              </Link>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs tracking-[0.1em] text-white">
                <span className="text-slate-300">Account</span>
                <SignedIn>
                  <UserButton afterSignOutUrl={loginRoute} />
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-slate-200">
                    <Link href={loginRoute} prefetch={false} onClick={() => setIsMobileNavOpen(false)}>
                      Login
                    </Link>
                    <span className="text-slate-500">/</span>
                    <Link href={registerRoute} prefetch={false} onClick={() => setIsMobileNavOpen(false)}>
                      Registrieren
                    </Link>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
