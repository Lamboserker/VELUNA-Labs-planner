'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSignIn, useSignUp } from '@clerk/nextjs';

type MessageState = {
  type: 'success' | 'error';
  text: string;
};

const successMessage = (mode: 'login' | 'register', email: string) => {
  if (mode === 'login') {
    return `Wir schicken dir einen Magic-Link an ${email}. Bitte kontrolliere dein Postfach.`;
  }
  return `Ein neuer Account für ${email} wird eingerichtet, sobald du den Link bestaetigst.`;
};

const errorMessage = () => ({
  type: 'error' as const,
  text: 'Fehler beim Starten der Anmeldung. Bitte versuche es erneut.',
});

export default function AuthPanel() {
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [message, setMessage] = useState<MessageState | null>(null);
  const searchParams = useSearchParams();
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const getTargetUrl = (value: string) => new URL(value, origin).toString();

  const isSignInReady = Boolean(signIn && isSignInLoaded);
  const isSignUpReady = Boolean(signUp && isSignUpLoaded);
  const isClientReady = mode === 'register' ? isSignUpReady : isSignInReady;
  const isGoogleReady = isSignInReady;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email) {
        setMessage(errorMessage());
        return;
      }

      setStatus('loading');
      setMessage(null);

      try {
        const returnBackUrl = searchParams.get('returnBackUrl') ?? '/app';
        const redirectUrl = new URL('/auth', origin).toString();
        const absoluteReturnUrl = getTargetUrl(returnBackUrl);

        if (mode === 'register') {
          if (!signUp || !isSignUpReady) {
            setMessage(errorMessage());
            return;
          }
          const createdSignUp = await signUp.create({
            emailAddress: email,
          });
          await createdSignUp.createEmailLinkFlow().startEmailLinkFlow({
            redirectUrl,
            redirectUrlComplete: absoluteReturnUrl,
          });
        } else {
          if (!signIn || !isSignInReady) {
            setMessage(errorMessage());
            return;
          }
          const createdSignIn = await signIn.create({
            identifier: email,
            strategy: 'email_link',
          });
          const emailAddressId = createdSignIn.supportedFirstFactors?.find(
            (factor) => factor.strategy === 'email_link' && 'emailAddressId' in factor
          )?.emailAddressId;

          if (!emailAddressId) {
            throw new Error('Email address ID not found');
          }

          await createdSignIn.createEmailLinkFlow().startEmailLinkFlow({
            emailAddressId,
            redirectUrl: absoluteReturnUrl,
          });
        }
        setMessage({
          type: 'success',
          text: successMessage(mode, email),
        });
      } catch (err) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : errorMessage().text,
        });
      } finally {
        setStatus('idle');
      }
    },
    [email, isSignInReady, isSignUpReady, mode, searchParams, signIn, signUp]
  );

  const handleGoogleSignIn = useCallback(async () => {
    if (!isSignInReady || !signIn) {
      setMessage(errorMessage());
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const returnBackUrl = searchParams.get('returnBackUrl') ?? '/app';
      const redirectUrl = new URL('/auth', origin).toString();
      const absoluteReturnUrl = getTargetUrl(returnBackUrl);
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl,
        redirectUrlComplete: absoluteReturnUrl,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : errorMessage().text,
      });
      setStatus('idle');
    }
  }, [isSignInReady, searchParams, signIn]);

  return (
    <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_35px_60px_rgba(2,6,23,0.65)]">
      <div className="flex gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
        {['login', 'register'].map((current) => (
          <button
            key={current}
            type="button"
            className={`flex-1 rounded-full px-4 py-2 transition ${
              mode === current
                ? 'bg-white/10 text-white shadow-inner'
                : 'bg-transparent text-slate-500 hover:text-white'
            }`}
            onClick={() => {
              setMode(current as 'login' | 'register');
              setMessage(null);
            }}
          >
            {current === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-300">
        {mode === 'login'
          ? 'Nutze deinen Posteingang für einen sicheren Magic-Link.'
          : 'Erstelle einen neuen Account mit deiner bevorzugten Mailadresse.'}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400" htmlFor="email">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
          placeholder="name@beispiel.de"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading' || !isClientReady}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === 'login' ? 'Magic-Link senden' : 'Account vorbereiten'}
        </button>
      </form>

      {message && (
        <p
          className={`text-sm font-semibold ${
            message.type === 'error' ? 'text-red-400' : 'text-cyan-300'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="border-t border-slate-800 pt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Oder</p>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={!isGoogleReady || status === 'loading'}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            className="h-4 w-4"
            fill="currentColor"
          >
            <path d="M488 261.8c0-17.7-1.6-34.7-4.5-51.2H249v97h135.6c-5.6 29.9-22.7 55.2-48.2 72.2v59.8h77.9c45.5-42 71.7-103.7 71.7-178.8zM249 492c65.9 0 121.1-21.9 161.3-59.4L332 372.8c-18.4 12.3-42 19.5-68.2 19.5-52.4 0-96.9-35.3-112.8-82.7H64.9v65.2C105.1 441.7 173.5 492 249 492zm-79.2-254.6c0-13 2.7-25.5 7.5-37.2V135h-134C58 178.1 64 222.3 86 256c7.7-17.8 21.7-32.9 39.8-41.6zm79.2-118.4c25 0 47.5 8.6 65.2 22.9l48.8-48.9C361.2 17.3 309.9 0 249 0 173.6 0 105.1 50.1 64.9 135.1l114.9 72.9c15.9-47.2 60.4-82.7 110.9-82.7z" />
          </svg>
          Google
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Wir nutzen Clerk, um dich sicher anzumelden. Deine Daten werden vertraulich behandelt.
      </p>
    </div>
  );
}
