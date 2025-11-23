import { ReactNode } from 'react';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkPublishableKey } from '@/lib/clerkEnv';

export const metadata = {
  title: 'Persönlicher Planer',
  description: 'Die perfekte Buehne für Fokus, Planung und Echtzeit-Insights.',
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
