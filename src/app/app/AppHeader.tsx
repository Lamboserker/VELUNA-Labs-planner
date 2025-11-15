'use client';
import Link from 'next/link';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Eingang', href: '/app/inbox' },
  { label: 'Planung', href: '/app/plan' },
  { label: 'Aufgaben', href: '/app/projects' },
  { label: 'Analysen', href: '/app/analytics' },
  { label: 'Projekte', href: '/app/projects' },
];

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function AppHeader() {
  const today = dateFormatter.format(new Date());
  const pathname = usePathname() ?? '/app/plan';
  const { user } = useUser();
  const emailLabel =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    user?.email ??
    'demo@planner.app';
  const isAuthenticated = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/40 bg-slate-950/80 shadow-[0_15px_30px_rgba(15,23,42,0.6)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 fixed left-0 top-0 ml-6 mt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.6)]">
            L
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 ">Persoenlicher Planer</p>
            <p className="text-sm font-semibold text-white">Klarheit in jedem Fokus</p>
          </div>
        </div>
        <nav>
          <ul className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href as any}
                    className={`transition ${isActive ? 'text-white' : 'text-slate-400'} ${
                      isActive
                        ? 'after:content-[""] after:block after:h-0.5 after:w-full after:bg-cyan-400 after:-mt-1'
                        : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-4 text-[0.55rem] font-semibold uppercase tracking-[0.35em]">
          <button className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-5 py-2 text-white shadow-[0_20px_40px_rgba(59,130,246,0.45)]">
            Neu
          </button>
          <div className="rounded-full border border-slate-700 px-4 py-2 text-xs tracking-[0.15em] text-slate-400">
            {today}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs tracking-[0.1em] text-white">
            <span className="block max-w-[140px] truncate">{emailLabel}</span>
            {isAuthenticated ? (
              <SignOutButton>
                <button className="rounded-full border border-slate-700 px-4 py-1 text-[0.45rem] tracking-[0.3em] text-slate-200">
                  Logout
                </button>
              </SignOutButton>
            ) : (
              <Link
                href="/auth"
                className="rounded-full border border-slate-700 px-4 py-1 text-[0.45rem] tracking-[0.3em] text-slate-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
