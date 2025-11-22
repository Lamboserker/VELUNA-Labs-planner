import { ReactNode } from 'react';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ModernFooter from '@/components/ModernFooter';
import { clerkPublishableKey } from '@/lib/clerkEnv';

export const metadata = {
  title: 'Persönlicher Planer',
  description: 'Die perfekte Buehne für Fokus, Planung und Echtzeit-Insights.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="de" suppressHydrationWarning>
        <body className="bg-slate-950 text-white antialiased safe-bottom">
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <ModernFooter />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
