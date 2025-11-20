import { ReactNode } from 'react';
import '../../styles/globals.css';
import AppHeader from './AppHeader';

export const metadata = {
  title: 'Persönlicher Planer',
  description: 'Alle Aufgaben, Projekte und Analysen an einem Ort.',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="safe-top safe-bottom min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
