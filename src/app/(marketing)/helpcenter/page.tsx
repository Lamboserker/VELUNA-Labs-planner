import HelpCenterClient from './HelpCenterClient';

export const metadata = {
  title: 'Help Center - Veluna Labs Support',
  description:
    'Finde Antworten auf Produktfragen, Zugangshilfe und Service-Ressourcen im Veluna Labs Help Center.',
};

export default function HelpCenterPage() {
  return <HelpCenterClient />;
}
