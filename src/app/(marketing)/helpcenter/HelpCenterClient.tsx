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
  {
    title: 'Rollenbasiertes Berechtigungsmodell',
    summary:
      'Was Owner, Admins, Projektleiter:innen und Contributors dürfen und wie du Limits sauber trennst.',
    category: 'Team & Zugriff',
    updated: 'vor 2 Tagen',
  },
  {
    title: 'Automatisierte Erinnerungen aktivieren',
    summary:
      'Nutze Benachrichtigungen für überfällige Tasks, unbestätigte Slots und fehlende Timesheets.',
    category: 'Produktivität',
    updated: 'vor 6 Tagen',
  },
  {
    title: 'SAML/SSO für Enterprises',
    summary:
      'So bindest du Azure AD, Okta oder Google Workspace über SAML an und definierst SCIM Provisioning.',
    category: 'Vertrauen & Sicherheit',
    updated: 'vor 1 Tag',
  },
  {
    title: 'API-Schlüssel ausstellen und revoken',
    summary:
      'Erstelle projektbezogene API Keys, setze Ablaufdaten und tracke Nutzung per Audit Trail.',
    category: 'Verbindungen',
    updated: 'vor 4 Tagen',
  },
  {
    title: 'Planung mit Kapazitätsgrenzen',
    summary:
      'Arbeitsstunden pro Woche hinterlegen, Urlaube berücksichtigen und Konflikte im Kalender erkennen.',
    category: 'Produktivität',
    updated: 'vor 3 Tagen',
  },
  {
    title: 'Audit-Logs exportieren',
    summary:
      'Lade revisionssichere Logs als CSV/JSON herunter oder sende sie per Webhook an dein SIEM.',
    category: 'Vertrauen & Sicherheit',
    updated: 'vor 2 Wochen',
  },
  {
    title: 'Mehrere Währungen in Projekten',
    summary:
      'Lege Budgets in EUR, USD oder GBP an und harmonisiere Wechselkurse für Reports.',
    category: 'Abrechnung',
    updated: 'vor 8 Tagen',
  },
  {
    title: 'Team-Handover & Verantwortlichkeiten',
    summary:
      'Definiere Stellvertretungen, lege Eskalationswege fest und dokumentiere Owner pro Projekt.',
    category: 'Team & Zugriff',
    updated: 'vor 5 Tagen',
  },
];

const faqs = [
  {
    question: 'Wie funktioniert die Suche nach Artikeln?',
    answer:
      'Nutze die Schlagwortsuche oben auf der Seite. Wir gleichen Titel, Zusammenfassungen und Kategorien ab und zeigen sofort passende Beiträge.',
    tag: 'Navigation',
  },
  {
    question: 'Kann ich Support direkt aus dem Help Center kontaktieren?',
    answer:
      'Ja. Über den Button "Support anfragen" öffnest du das Kontaktformular. Du kannst außerdem bei jedem Artikel einen neuen Vorgang anstoßen.',
    tag: 'Support',
  },
  {
    question: 'Wie oft werden Inhalte aktualisiert?',
    answer:
      'Produkt- und Sicherheitsartikel werden wöchentlich kuratiert. Bei Releases oder Incidents aktualisieren wir innerhalb von 24 Stunden.',
    tag: 'Aktualität',
  },
  {
    question: 'Gibt es geführte Onboarding-Guides?',
    answer:
      'Ja. Unter "Erste Schritte" findest du Schritt-für-Schritt-Anleitungen für Workspace-Setup, Rollen und erste Projekte.',
    tag: 'Onboarding',
  },
  {
    question: 'Welche Sprachen unterstützt das Help Center?',
    answer:
      'Aktuell pflegen wir Inhalte auf Deutsch und Englisch. Wir erweitern das Angebot je nach Nachfrage um weitere Lokalisierungen.',
    tag: 'Lokalisierung',
  },
  {
    question: 'Wie melde ich einen Sicherheitsvorfall?',
    answer:
      'Nutze den Bereich "Vertrauen & Sicherheit" oder schreibe direkt an security@veluna.labs mit einer kurzen Beschreibung und betroffenen Accounts.',
    tag: 'Security',
  },
  {
    question: 'Kann ich API-Beispiele testen?',
    answer:
      'Ja. In den Artikeln zu API-Keys und Webhooks findest du verlinkte Postman-Collections sowie Beispiel-Requests.',
    tag: 'API',
  },
  {
    question: 'Wie erhalte ich Updates zu Release Notes?',
    answer:
      'Abonniere den Newsletter über "Release Notes abonnieren" oder folge unserem Status-Feed. Beide Kanäle informieren vor Deployments.',
    tag: 'Produkt',
  },
  {
    question: 'Was passiert, wenn keine Suchtreffer erscheinen?',
    answer:
      'Passe deine Begriffe an oder wechsle die Kategorie. Wir zeigen dir außerdem den Link zum Support, damit du direkt nachfragen kannst.',
    tag: 'Navigation',
  },
  {
    question: 'Kann ich Help-Center-Artikel exportieren?',
    answer:
      'Exportiere einzelne Artikel als PDF über die Browser-Druckfunktion. Für Sammelexporte kontaktiere das Team, wir stellen ein Bundle bereit.',
    tag: 'Dokumentation',
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

        <section className="space-y-6 rounded-3xl bg-slate-950/70 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.8)]">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">FAQ</p>
            <h3 className="text-2xl font-semibold text-white">Häufige Fragen & schnelle Antworten</h3>
            <p className="text-sm text-slate-300">
              Eine Sammlung der gängigsten Fragen unserer Teams – fokussiert auf Navigation, Sicherheit, API und Produkt-Updates.
              So findest du schneller eine Lösung, ohne den Support zu kontaktieren.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-[0_15px_45px_rgba(2,6,23,0.8)]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
                  <span>{item.tag}</span>
                  <span>FAQ</span>
                </div>
                <h4 className="text-lg font-semibold text-white">{item.question}</h4>
                <p className="text-sm text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
