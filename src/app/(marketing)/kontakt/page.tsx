import Link from 'next/link';

export const metadata = {
  title: 'Kontakt - Veluna Labs',
  description: 'So erreichst du das Veluna Labs Team fuer Fragen, Support und Anfragen.',
};

const channels = [
  { label: 'Email', value: 'hello@veluna.labs' },
  { label: 'Telefon', value: '+49 (0) 2261 9945514' },
  { label: 'Support', value: 'https://status.veluna.labs' },
];

const whatsappLink = 'https://wa.me/4922619945514';

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Kontakt</p>
          <h1 className="text-4xl font-semibold text-white">Hol dir eine persoenliche Antwort.</h1>
          <p className="text-sm text-slate-400">
            Schreib uns bei Fragen zu Onboarding, Rechnungen oder dein Team. Wir melden uns innerhalb eines Werktages.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl bg-slate-950/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.8)]">
          {channels.map((channel) => (
            <div key={channel.label} className="flex flex-col gap-1 text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">{channel.label}</span>
              <p className="text-base font-semibold text-white">
                {channel.label === 'Support' ? (
                  <a
                    href={channel.value}
                    className="transition hover:text-cyan-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {channel.value}
                  </a>
                ) : (
                  channel.value
                )}
              </p>
            </div>
          ))}
        </section>

        <div className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">WhatsApp</p>
          <p className="text-base font-semibold text-white">+49 (0) 2261 9945514</p>
          <p>
            Schnelle Antworten, wenn du lieber WhatsApp nutzt. Wir melden uns innerhalb eines Werktages.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center rounded-full border border-cyan-400/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 transition hover:border-cyan-300 hover:text-white"
          >
            WhatsApp schreiben
          </a>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300">
          <p>Alternative: Unser neues Help Center fasst alle Guides und Antworten zusammen.</p>
          <Link href="/helpcenter" className="text-cyan-300 transition hover:text-white">
            Help Center besuchen
          </Link>
        </div>
      </div>
    </main>
  );
}
