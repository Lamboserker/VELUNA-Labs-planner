import type { ReactNode } from 'react';
import MarketingNavbar from '@/components/MarketingNavbar';
import ModernFooter from '@/components/ModernFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <div className="flex-1">{children}</div>
      <ModernFooter />
    </div>
  );
}
