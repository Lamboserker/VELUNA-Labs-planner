import Link from "next/link";

const productLinks = [
  { label: "Startseite", href: "/" },
  { label: "Dashboard", href: "/app" },
  { label: "In den Planer starten", href: "/auth" },
];

const legalLinks = [
  { label: "AGB", href: "/agb" },
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "Sicherheit", href: "/sicherheit" },
];

const contactLinks = [
  { label: "Kontakt", href: "/kontakt" },
  { label: "Help Center", href: "/helpcenter" },
  { label: "Statusseite", href: "https://status.veluna.labs" },
];

export default function ModernFooter() {
  return (
    <footer className="border-t border-slate-800/70 bg-slate-950/90 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-6 border-b border-slate-800/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Veluna Labs
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Planung, die sich anpasst, ohne Stress drinnen zu lassen.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-400">
              Wir verbinden Aufgaben, Kalender und Fokusblöcke in einem
              Dashboard, das Teams erlaubt, nicht nur zu sehen, was kommt,
              sondern auch direkt den nächsten Schritt zu planen.
            </p>
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Kontakt
            </p>
            <p className="text-sm text-white">kontakt@veluna.labs</p>
            <p className="text-sm">+49 (0) 2261 9945514</p>
            <p className="text-sm text-slate-500">Gummersbach • Remote team</p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Produkt
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {productLinks.map((item) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-slate-300 transition hover:text-white"
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Rechtliches
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Service
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {contactLinks.map((item) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-slate-300 transition hover:text-white"
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-6 text-xs uppercase tracking-[0.35em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Veluna Labs. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap gap-4 text-[0.69rem]">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
