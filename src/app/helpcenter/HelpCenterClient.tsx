'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const articles = [
  {
    title: 'Workspace und Projekte konfigurieren',
    summary:
      'Teams richten Workspace-Templates ein, definieren Rollen und legen Projekte samt Kategorien an.',
    category: 'Erste Schritte',
    updated: 'vor 1 Woche',
  },
  {
    title: 'Clerk-Zugang und Invite-Links',
    summary:
      'Verwalte Benutzer, lade neue Mitglieder mit Einladungslinks ein und verknüpfe die richtigen Rollen.',
    category: 'Team & Zugriff',
    updated: 'gestern',
  },
  {
    title: 'Aufgaben priorisieren und Energie-Levels festlegen',
    summary:
      'Lerne, wie Fokus-Score, Priorität und Energie zusammenkommen, damit der Planer Smart Blöcke bildet.',
    category: 'Produktivität',
    updated: 'vor 3 Tagen',
  },
  {
    title: 'Kalender synchronisieren',
    summary:
      'Verbinde Google- oder Microsoft-Kalender mit dem Planer, um Meetings automatisch zu blocken.',
    category: 'Verbindungen',
    updated: 'vor 2 Wochen',
  },
  {
    title: 'Budget-Richtlinien & Freigaben',
    summary:
      'Setze Limits für Aufwand pro Rolle, erstelle Genehmigungs-Workflows und verfolge Auslastung.',
    category: 'Team & Zugriff',
    updated: 'vor 3 Tagen',
  },
  {
    title: 'Zahlungen, Rechnungen & Abos',
    summary:
      'Verwalte dein Abonnement: Rechnungsverlauf, Zahlungsmethoden und Firmenanschrift.',
    category: 'Abrechnung',
    updated: 'vor 4 Tagen',
  },
  {
    title: 'Release Notes & Roadmap',
    summary:
      'Alle Produktverbesserungen, geplante Features und geplante Wartungsfenster á la Veluna Labs.',
    category: 'Produktivität',
    updated: 'heute',
  },
  {
    title: 'Sicherheits- und Compliance-Anfragen',
    summary:
      'Anfragen zu Datensicherheit, Verschlüsselung und Audit-Reports verfolgen wir im Ticket-System.',
    category: 'Vertrauen & Sicherheit',
    updated: 'vor 5 Tagen',
  },
];

const quickResources = [
  {
    title: 'Status & Incident Updates',
    body: 'Überwache Echtzeit-Status, geplante Wartungen und historische Vorfälle.',
    href: 'https://status.veluna.labs',
  },
  {
    title: 'Release Notes abonnieren',
    body: 'Bleib informiert mit Release-Emails, die Features, Fixes und Roadmap-Insights transportieren.',
    href: 'mailto:hello@veluna.labs',
  },
];

export default function HelpCenterClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Alle');

  const categories = useMemo(
    () => ['Alle', ...new Set(articles.map((article) => article.category))],
    [],
  );

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return articles.filter((article) => {
      const inCategory = category === 'Alle' || article.category === category;
      if (!inCategory) return false;
      if (normalizedQuery === '') return true;
      const haystack = `${article.title} ${article.summary} ${article.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [category, query]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <section className="space-y-6 rounded-3xl bg-slate-950/70 p-10 shadow-[0_25px_60px_rgba(2,6,23,0.8)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Help Center</p>
          <h1 className="text-4xl font-semibold text-white">Antworten, Guides und Service-Updates zentral gesammelt.</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Unser Help Center öffnet dir den direkten Weg zu Onboarding-Anleitungen, Berechtigungen, Zahlungsdetails
            und Security-Informationen. Wähle ein Thema aus oder suche nach deiner konkreten Frage.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="help-search" className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Frage eingeben
              </label>
              <input
                id="help-search"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="Zum Beispiel: How to invite teammates?"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                aria-label="Help Center Suche"
              />
            </div>
            <Link
              href="/kontakt"
              className="rounded-full border border-cyan-400/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 transition hover:border-cyan-300 hover:text-white"
            >
              Support anfragen
            </Link>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl bg-slate-950/70 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.8)]">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => {
              const isActive = cat === category;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              {filteredArticles.length === 0 ? (
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 text-sm text-slate-400">
                  <p>Keine Artikel gefunden. Versuche es mit anderen Schlagworten oder kontaktiere unser Team.</p>
                  <Link href="/kontakt" className="text-cyan-300 transition hover:text-white">
                    Support kontaktieren
                  </Link>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <article
                    key={article.title}
                    className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.8)]"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
                      <span>{article.category}</span>
                      <span>{article.updated}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-white">{article.title}</h2>
                    <p className="text-sm text-slate-300">{article.summary}</p>
                    <Link href="/kontakt" className="text-sm font-semibold text-cyan-300 transition hover:text-white">
                      Frage stellen →
                    </Link>
                  </article>
                ))
              )}
            </div>

            <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-300 shadow-[0_20px_60px_rgba(2,6,23,0.8)]">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Schnellzugriffe</p>
                <h3 className="text-xl font-semibold text-white">Weitere Ressourcen</h3>
                <p>
                  Neben den Artikeln findest du Service-Updates, Statusinformationen und Release Notes in einem Blick.
                </p>
              </div>
              <div className="space-y-4">
                {quickResources.map((resource) => (
                  <a
                    key={resource.href}
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-200 transition hover:border-cyan-400/80 hover:text-white"
                  >
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{resource.title}</p>
                    <p className="text-sm text-slate-300">{resource.body}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
