import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkPublishableKey } from '@/lib/clerkEnv';

export const metadata: Metadata = {
  title: 'Persönlicher Planer',
  description: 'Die perfekte Buehne für Fokus, Planung und Echtzeit-Insights.',
  manifest: '/site.webmanifest',
  themeColor: '#0f172a',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="de" suppressHydrationWarning>
        <body className="bg-slate-950 text-white antialiased safe-bottom">{children}</body>
      </html>
    </ClerkProvider>
  );
}
