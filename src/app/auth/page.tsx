import AuthPanel from '@/components/AuthPanel';
import AuthRedirectHandler from '@/components/AuthRedirectHandler';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Anmelden oder Registrieren',
  description: 'Melde dich an oder erstelle einen neuen Account fuer den Persoenlichen Planer.',
};

type AuthPageProps = {
  searchParams?: Promise<{
    returnBackUrl?: string | string[];
  }>;
};

const resolveReturnBackUrl = (value?: string | string[]): string => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.length > 0) ?? '/app';
  }
  return '/app';
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const returnBackUrl = resolveReturnBackUrl(resolvedSearchParams?.returnBackUrl);
  const fallbackToDashboard = returnBackUrl === '/auth' || returnBackUrl.startsWith('/auth?');
  const targetRedirectUrl = fallbackToDashboard ? '/app' : returnBackUrl;
  const { userId } = await auth();
  if (userId) {
    redirect(targetRedirectUrl);
  }

  return (
    <>
      <AuthRedirectHandler />
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
            <div className="mt-8 flex w-full justify-center">
              <div id="clerk-captcha" className="w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
