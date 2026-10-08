'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', icon: 'Home', label: 'Home' },
  { href: '/explore', icon: 'Compass', label: 'Explore' },
  { href: '/apod', icon: 'Star', label: 'APOD' },
  { href: '/mars', icon: 'Orbit', label: 'Mars' },
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'You' },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-[var(--bg-base)]/95 backdrop-blur-lg lg:hidden">
      {tabs.map((tab) => {
        const Icon = require('lucide-react')[tab.icon] ?? require('lucide-react').Circle;
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={cn('flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs', active ? 'text-primary' : 'text-muted-foreground')}>
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
