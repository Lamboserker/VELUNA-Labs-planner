import { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Persoenlicher Planer',
  description: 'Die perfekte Buehne fuer Fokus, Planung und Echtzeit-Insights.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-white">{children}</body>
    </html>
  );
}
