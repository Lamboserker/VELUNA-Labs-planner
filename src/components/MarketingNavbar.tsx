'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/veluna-labs-logo.png';

const navLinks: { label: string; href: Route }[] = [
  { label: 'Produkt', href: '/' as Route },
  { label: 'Help Center', href: '/helpcenter' as Route },
  { label: 'Kontakt', href: '/kontakt' as Route },
  { label: 'Sicherheit', href: '/sicherheit' as Route },
];

export default function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Zur Startseite">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 shadow-[0_10px_25px_rgba(15,23,42,0.6)]">
            <Image src={Logo} alt="Veluna Labs Logo" width={36} height={36} style={{ height: 'auto' }} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-slate-400">Veluna Labs</span>
            <span className="text-sm font-semibold text-white">Planer</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-slate-300 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-white ${
                  isActive ? "text-white after:mt-1 after:block after:h-0.5 after:w-full after:bg-cyan-400" : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-200">
          <Link
            href="/auth/login"
            className="rounded-full border border-slate-800/80 px-4 py-2 transition hover:border-cyan-400 hover:text-cyan-200"
          >
            Login
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-5 py-2 text-white shadow-[0_16px_40px_rgba(59,130,246,0.35)]"
          >
            App öffnen
          </Link>
        </div>
      </div>
    </header>
  );
}
