'use client';

import { AppProvider } from '@/components/AppProvider';
import { Navigation } from '@/components/ui/Navigation';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide nav on game screens
  const isGameScreen = pathname.startsWith('/games/');

  return (
    <AppProvider>
      <div className="min-h-screen pb-16">
        {children}
      </div>
      {!isGameScreen && <Navigation />}
    </AppProvider>
  );
}
