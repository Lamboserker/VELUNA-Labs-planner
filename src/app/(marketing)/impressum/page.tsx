import Link from "next/link";

export const metadata = {
  title: "Impressum - Veluna Labs",
  description:
    "Impressum und rechtliche Angaben zum Veluna Labs Personal Planner.",
};

const contactDetails = [
  { label: "Firma", value: "Veluna Labs UG" },
  { label: "Adresse", value: "Gummersbach" },
  { label: "Registergericht", value: "Amtsgericht Köln, HRB 123456" },
  { label: "USt-ID", value: "DE123456789" },
];

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Impressum
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Offizielle Angaben & Verantwortlichkeiten
          </h1>
          <p className="text-sm text-slate-400">
            Das hier sind unsere formellen Daten. Bei Fragen rund um Rechnung,
            Recht oder Datenschutz stehen wir dir gerne zur Seite.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl bg-slate-950/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.8)]">
          {contactDetails.map((entry) => (
            <div
              key={entry.label}
              className="flex flex-col gap-1 text-sm text-slate-300"
            >
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {entry.label}
              </span>
              <p className="text-base font-semibold text-white">
                {entry.value}
              </p>
            </div>
          ))}

          <div className="border-t border-slate-800/60 pt-6 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Vertretungsberechtigte
            </p>
            <p>Geschäftsführer: Lukas Oliver Lamberz</p>
            <p>Leitung Vertrieb: Christian Mihalkov</p>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300">
          <p>Du brauchst eine Rechnung oder willst uns direkt erreichen?</p>
          <Link
            href="/kontakt"
            className="text-cyan-300 transition hover:text-white"
          >
            Zum Kontaktformular
          </Link>
        </div>
      </div>
    </main>
  );
}
