'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass: require('lucide-react').Compass,
  Star: require('lucide-react').Star,
  Orbit: require('lucide-react').Orbit,
  Asteroid: require('lucide-react').Rocket,
  Globe: require('lucide-react').Globe,
  FolderOpen: require('lucide-react').FolderOpen,
  LayoutDashboard: require('lucide-react').LayoutDashboard,
  Info: require('lucide-react').Info,
};

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-border/40 p-4 lg:block">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] ?? require('lucide-react').Circle;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
                active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
