import { ReactNode } from 'react';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Persoenlicher Planer',
  description: 'Die perfekte Buehne fuer Fokus, Planung und Echtzeit-Insights.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="de" className="fusion-extension-loaded">
        <body className="bg-slate-950 text-white">{children}</body>
      </html>
    </ClerkProvider>
  );
}
