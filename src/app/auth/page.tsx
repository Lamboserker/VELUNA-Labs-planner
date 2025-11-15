import AuthPanel from '@/components/AuthPanel';

export const metadata = {
  title: 'Anmelden oder Registrieren',
  description: 'Melde dich an oder erstelle einen neuen Account fuer den Persoenlichen Planer.',
};

export default function AuthPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Zugang</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Sichere Anmeldung</h1>
          <p className="mt-2 text-sm text-slate-300">
            Verwende Clerk fuer Magic-Links oder den Google-Zugang, um sicher in dein Dashboard zu gelangen.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <AuthPanel />
        </div>
      </div>
    </section>
  );
}
