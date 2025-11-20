import Link from "next/link";
import Image from "next/image";
import StartPlanButton from "@/components/StartPlanButton";

import AnalyzeIcon from "@/assets/icons/analyze.png";
import TaskIcon from "@/assets/icons/task.png";
import CalendarIcon from "@/assets/icons/calendar.png";
import ProjectIcon from "@/assets/icons/project.png";

const metrics = [
  { label: "Geplante Fokuszeit", value: "600m", sub: "für diese Woche" },
  { label: "Deadlines im Blick", value: "4", sub: "kritische Aufgaben" },
  { label: "Team-Transparenz", value: "100%", sub: "Status live sichtbar" },
];

const steps = [
  {
    title: "Projekte anlegen",
    desc: "Strukturiere deine Arbeit in klare Projekte mit Ziel, Kategorie und Verantwortlichen.",
  },
  {
    title: "Aufgaben planen",
    desc: "Zerlege Arbeit in Aufgaben mit Aufwand, Priorität und Energie-Level – inkl. Deadline.",
  },
  {
    title: "Zeitblöcke im Kalender",
    desc: "Der Planer verteilt Aufgaben automatisch als Termine, bis die benötigten Stunden erreicht sind.",
  },
];

const features = [
  {
    title: "Projekt- & Rollenstruktur",
    desc: "Ordne Aufgaben Projekten, Kategorien und Rollen zu. Jeder sieht genau, was zu ihm gehört.",
    icon: ProjectIcon,
  },
  {
    title: "Aufgaben, Prioritäten & Energie",
    desc: "Plane nach Priorität, Energie und Fokusfenstern statt nach einer simplen To-do-Liste.",
    icon: TaskIcon,
  },
  {
    title: "Kalender & Fokusfenster",
    desc: "Verknüpfe deinen Kalender, blocke Meetings und halte freie Fokuszeit konsequent frei.",
    icon: CalendarIcon,
  },
  {
    title: "Analysen & Fortschritt",
    desc: "Sieh in Echtzeit, wie viel erledigt ist, wo Blocker sitzen und welche Deadlines näher kommen.",
    icon: AnalyzeIcon,
  },
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 sm:gap-16">
        {/* HERO */}
        <section className="relative flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-indigo-950/80 p-10 text-center shadow-[0_32px_80px_rgba(15,23,42,0.85)] sm:p-12 lg:p-16">
          {/* LOGO */}
          <div className="flex flex-col items-center">
            <Image
              src="/veluna-labs-logo.png"
              alt="Veluna Labs Logo"
              width={360}
              height={360}
              priority
              className="drop-shadow-[0_40px_120px_rgba(251,146,60,0.55)]"
            />

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Persönlicher Planer
            </p>
          </div>

          {/* HEADLINE */}
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white sm:mt-4 sm:text-5xl lg:text-6xl">
            Klarheit in jedem Projekt.
            <span className="block bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
              Aufgaben, Termine und Fokus verknüpft in einem System.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Der Veluna-Labs Planer verbindet Aufgaben, Projekte und Kalender.
            Aufgaben werden automatisch als Zeitblöcke eingeplant, bis die
            benötigten Stunden zur Deadline erfüllt sind – damit Teams
            zuverlässig liefern und nichts untergeht.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <StartPlanButton />

            <Link
              href="/app"
              prefetch={false}
              className="rounded-full border border-slate-700/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Produktivitäts-Dashboard ansehen
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Keine To-do-Liste mehr. Ein durchgehender Fokusplan.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="grid gap-8 rounded-3xl bg-slate-950/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.8)] md:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Wie der Planer arbeitet
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Von Idee zu einem realistischen Zeitplan.
            </h2>
            <p className="text-sm text-slate-300 sm:mt-1 sm:text-base">
              Der Veluna-Labs Planer ist mehr als eine To-do-Liste: Er baut aus
              Aufgaben einen Zeitplan, der mit deinem Kalender synchron läuft.
              So siehst du frühzeitig, wenn Deadlines unrealistisch werden – und
              kannst gezielt gegensteuern.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl bg-slate-900/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.7)] ring-1 ring-slate-800"
              >
                <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-500 text-xs font-bold text-slate-950">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Kernfunktionen
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Alles, was Teams für klare Planung brauchen.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Projekte, Aufgaben, Termine und Analysen greifen ineinander.
                Jede Aufgabe ist zugeordnet - jede Stunde bis zur Deadline wird
                sichtbar verplant.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-3xl bg-slate-950/80 p-6 shadow-[0_24px_50px_rgba(15,23,42,0.75)] ring-1 ring-slate-800/80"
              >
                <div className="pointer-events-none absolute -right-2 -top-10 h-32 w-32 rounded-full bg-[conic-gradient(from_220deg,_rgba(56,189,248,0.35),_rgba(129,140,248,0.25),_transparent_70%)] translate-x-6 translate-y-2">
                  <div className="flex h-full w-full items-center justify-center">
                    <Image
                      src={feature.icon}
                      alt={`${feature.title} icon`}
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_26px_60px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-indigo-950/95 px-6 py-8 sm:px-8 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Nächster Schritt
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                Starte mit klaren Fokusblöcken statt nur mit Listen.
              </h2>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Erstelle dein erstes Projekt, plane Aufgaben bis zur Deadline
                und sieh zu, wie dein Kalender sich automatisch mit produktiver
                Zeit füllt.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <StartPlanButton />
              <Link
                href="/auth"
                prefetch={false}
                className="rounded-full border border-slate-700/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Konto erstellen
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
