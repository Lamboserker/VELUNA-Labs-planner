import Link from 'next/link';

export const metadata = {
  title: 'Datenschutz - Veluna Labs',
  description: 'Informationen zu Verarbeitung personenbezogener Daten im Veluna Labs Planer.',
};

const sections = [
  {
    title: 'Informierte Nutzung',
    body:
      'Persoenliche Daten werden nur im Rahmen deiner Nutzung gespeichert. Wir verarbeiten Namen, Email und Planungsdaten, um dir Aufgaben, Kalender und Insights zu liefern.',
  },
  {
    title: 'Speicherung & Sicherheit',
    body:
      'Alle Inhalte werden in der EU gehostet und verschluesselt gespeichert. Schnittstellen nutzen TLS und rollenbasierte Zugriffskontrollen sorgen dafuer, dass nur befugte Mitarbeiter Daten sehen.',
  },
  {
    title: 'Rechte der Nutzer',
    body:
      'Du kannst jederzeit Zugriff, Berichtigung oder Loeschung deiner Daten verlangen. Schreibe uns eine Nachricht oder nutze das Kontaktformular, um deine Anfrage mit Beleg zu senden.',
  },
];

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Datenschutz
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Deine Daten bleiben privat und transparent.
          </h1>
          <p className="text-sm text-slate-400">
            Wir beschreiben klar, welche Daten wir brauchen und wie sie geschuetzt werden. Informationen stehen jederzeit in deinem Konto bereit.
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
          <p>Du willst deine Daten einsehen oder loeschen lassen?</p>
          <Link href="/kontakt" className="text-cyan-300 transition hover:text-white">
            Anfrage an unser Team senden
          </Link>
        </div>
      </div>
    </main>
  );
}
