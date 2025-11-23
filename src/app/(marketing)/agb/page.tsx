import Link from 'next/link';

export const metadata = {
  title: 'AGB - Veluna Labs Personal Planner',
  description: 'Allgemeine Geschaeftsbedingungen fuer die Nutzung des Veluna Labs Planers.',
};

const sections = [
  {
    title: 'Geltungsbereich',
    body:
      'Diese AGB gelten fuer alle Dienstleistungen des Veluna Labs Personal Planners. Sie bilden die Grundlage fuer den Einsatz der Plattform, solange kein gesonderter Vertrag vorliegt.',
  },
  {
    title: 'Leistungsumfang & Laufzeit',
    body:
      'Wir liefern eine integrierte Planungsoberflaeche mit Aufgaben, Kalendern und Insights. Verträge starten mit dem ersten Nutzerzugang und lassen sich monatlich oder jaehrlich verlaengern. Ruckwirkende Anpassungen werden in Abstimmung dokumentiert.',
  },
  {
    title: 'Zahlung & Kuendigung',
    body:
      'Rechnungen werden im Voraus gestellt und gelten als innerhalb von 14 Tagen bezahlt. Kuendigungen muessen schriftlich erfolgen; die Laufzeit endet mit Ablauf der gewählten Periode. Bei Zahlungsausfall pausieren wir den Zugriff bis zur Begleichung.',
  },
];

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Allgemeine Geschaeftsbedingungen
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Transparente Regeln, damit Teams besser starten.
          </h1>
          <p className="text-sm text-slate-400">
            Diese Bedingungen regeln, wie unsere Plattform genutzt werden darf. Wir halten klare Prozesse ein, damit du
            Planung ohne Verwirrung bekommst.
          </p>
        </header>

        <section className="space-y-8 rounded-3xl bg-slate-950/60 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.8)]">
          {sections.map((section) => (
            <article key={section.title} className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <p className="text-sm text-slate-300">{section.body}</p>
            </article>
          ))}
        </section>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300 shadow-[0_20px_40px_rgba(2,6,23,0.7)]">
          <p>Fragen zu den AGB? Wir helfen schnell weiter.</p>
          <Link href="/kontakt" className="text-cyan-300 transition hover:text-white">
            Zur Kontaktseite
          </Link>
        </div>
      </div>
    </main>
  );
}
