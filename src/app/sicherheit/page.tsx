import Link from 'next/link';

export const metadata = {
  title: 'Sicherheit - Veluna Labs',
  description: 'Ueberblick zu technischen Massnahmen und Prozessen im Veluna Labs Planer.',
};

const sections = [
  {
    title: 'Technische Sicherheitsmassnahmen',
    body:
      'TLS-Verschluesselung fuer alle uebertragenen Daten, regelmaessige Backups und Intrusion Detection Monitoring sorgen dafuer, dass dein Workspace rund um die Uhr geschuetzt ist.',
  },
  {
    title: 'Zugriff & Rollen',
    body:
      'Rollenbasierte Berechtigungen erlauben es nur autorisierten Mitarbeitern, in deine Konten zu schauen. Interne Audits und Schulungen halten unsere Abläufe aktuell.',
  },
  {
    title: 'Incident Response',
    body:
      'Im Fall eines Vorfalls informiert unser Security-Team schnell, analysiert die Ursache und leitet Massnahmen ein. Wir dokumentieren Vorfälle nachvollziehbar und teilen Learnings.',
  },
];

export default function SicherheitPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Sicherheit
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Wir bauen Schutzmechanismen, bevor sie gebraucht werden.
          </h1>
          <p className="text-sm text-slate-400">
            Unsere Teams testen und verbessern die Infrastruktur staendig, damit dein Fokusplan sicher bleibt und nur Teams Zugriff gewinnen, die wirklich dran arbeiten.
          </p>
        </header>

        <section className="space-y-8 rounded-3xl bg-slate-950/60 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.8)]">
          {sections.map((section) => (
            <article key={section.title} className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <p className="text-sm text-slate-300">{section.body}</p>
            </article>
          ))}
        </section>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300">
          <p>Du willst mehr wissen oder eine Security-Review anfragen?</p>
          <Link href="/kontakt" className="text-cyan-300 transition hover:text-white">
            Unser Security-Team kontaktieren
          </Link>
        </div>
      </div>
    </main>
  );
}
