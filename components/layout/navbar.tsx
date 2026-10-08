'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Telescope, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-[var(--bg-base)]/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <Telescope className="h-6 w-6 text-nebula-violet" />
          <span className="gradient-heading">COSMOS VAULT</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] ?? require('lucide-react').Circle;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github className="h-5 w-5" /></a>
          </Button>
          <Button variant="gradient" size="sm" asChild className="hidden sm:flex">
            <Link href="/explore">Launch</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border/40 lg:hidden">
          <div className="container mx-auto grid grid-cols-2 gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] ?? require('lucide-react').Circle;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
