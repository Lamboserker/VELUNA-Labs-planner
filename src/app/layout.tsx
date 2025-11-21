import { ReactNode } from 'react';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ModernFooter from '@/components/ModernFooter';

export const metadata = {
  title: 'Pers��nlicher Planer',
  description: 'Die perfekte Buehne fǬr Fokus, Planung und Echtzeit-Insights.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Clerk publishable key.');
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/auth/login"
      signUpUrl="/auth/register"
      afterSignOutUrl="/"
    >
      <html lang="de" className="fusion-extension-loaded">
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
