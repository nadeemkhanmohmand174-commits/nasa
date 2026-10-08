const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function w(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log('✓', filePath);
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════════════════

w('components/layout/navbar.tsx', `'use client';
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
  Asteroid: require('lucide-react').Asteroid,
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
`);

w('components/layout/sidebar.tsx', `'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass: require('lucide-react').Compass,
  Star: require('lucide-react').Star,
  Orbit: require('lucide-react').Orbit,
  Asteroid: require('lucide-react').Asteroid,
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
`);

w('components/layout/footer.tsx', `import Link from 'next/link';
import { Telescope } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-[var(--bg-elevated)] py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold">
              <Telescope className="h-5 w-5 text-nebula-violet" />
              <span className="gradient-heading">COSMOS VAULT</span>
            </div>
            <p className="text-sm text-muted-foreground">NASA research media and data exploration platform.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground">All Media</Link></li>
              <li><Link href="/apod" className="hover:text-foreground">APOD</Link></li>
              <li><Link href="/mars" className="hover:text-foreground">Mars Rovers</Link></li>
              <li><Link href="/neo" className="hover:text-foreground">Near-Earth Objects</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href={SOCIAL_LINKS.nasaApi} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">NASA API Portal</a></li>
              <li><a href={SOCIAL_LINKS.nasaImages} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">NASA Image Library</a></li>
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>NASA data is public domain</li>
              <li>Images © NASA/JPL</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
          <p>Built with Next.js, Tailwind CSS, Supabase & Cloudinary. Data provided by NASA APIs.</p>
        </div>
      </div>
    </footer>
  );
}
`);

w('components/layout/mobile-tab-bar.tsx', `'use client';
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
`);

// ═══════════════════════════════════════════════════════════════
// MEDIA COMPONENTS
// ═══════════════════════════════════════════════════════════════

w('components/media/media-card.tsx', `'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import { SourceBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDatePretty, truncate } from '@/lib/utils';
import type { MediaAsset } from '@/types';

interface MediaCardProps {
  asset: MediaAsset;
  index?: number;
  onFavorite?: (asset: MediaAsset) => void;
  isFavorite?: boolean;
}

export function MediaCard({ asset, index = 0, onFavorite, isFavorite }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group glass-card relative overflow-hidden"
    >
      <Link href={\`/asset/\${asset.id}\`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {asset.thumbUrl ? (
            <img src={asset.thumbUrl} alt={asset.title} loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className={cn('flex h-full items-center justify-center bg-gradient-to-br', \`from-source-\${asset.source}/20 to-source-\${asset.source}/5\`)}>
              <span className="text-4xl opacity-30">{asset.kind === 'video' ? '🎬' : asset.kind === 'dataset' ? '📊' : '📄'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute left-2 top-2"><SourceBadge source={asset.source} /></div>
          {asset.kind === 'video' && (
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">VIDEO</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={\`/asset/\${asset.id}\`}>
          <h3 className="mb-1 line-clamp-2 font-heading text-sm font-semibold leading-tight hover:text-primary">{truncate(asset.title, 60)}</h3>
        </Link>
        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{truncate(asset.description ?? '', 100)}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDatePretty(asset.date)}</span>
          {asset.credit && <span className="truncate">{truncate(asset.credit, 20)}</span>}
        </div>
        {onFavorite && (
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => { e.preventDefault(); onFavorite(asset); }} aria-label="Toggle favorite">
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
`);

w('components/media/media-grid.tsx', `'use client';
import { MediaCard } from './media-card';
import type { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  assets: MediaAsset[];
  variant?: 'grid' | 'masonry' | 'list';
  onFavorite?: (asset: MediaAsset) => void;
  favorites?: Set<string>;
}

export function MediaGrid({ assets, variant = 'grid', onFavorite, favorites }: MediaGridProps) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {assets.map((asset, i) => (
          <MediaCard key={asset.id} asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
        ))}
      </div>
    );
  }

  if (variant === 'masonry') {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {assets.map((asset, i) => (
          <div key={asset.id} className="mb-4 break-inside-avoid">
            <MediaCard asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
      {assets.map((asset, i) => (
        <MediaCard key={asset.id} asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
      ))}
    </div>
  );
}
`);

w('components/media/media-skeleton.tsx', `import { Skeleton } from '@/components/ui/skeleton';

export function MediaSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden rounded-xl">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
`);

w('components/media/lightbox.tsx', `'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { MediaAsset } from '@/types';

interface LightboxProps {
  asset: MediaAsset | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({ asset, onClose, onPrev, onNext }: LightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 1));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl border-border/40 bg-black/95 p-0">
        <div className="relative flex h-[80vh] items-center justify-center overflow-hidden">
          {asset.fullUrl ? (
            <img src={asset.fullUrl} alt={asset.title}
              style={{ transform: \`scale(\${zoom})\` }}
              className="max-h-full max-w-full object-contain transition-transform duration-200" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No preview available</div>
          )}

          {onPrev && (
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={onPrev} aria-label="Previous"><ChevronLeft className="h-6 w-6" /></Button>
          )}
          {onNext && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={onNext} aria-label="Next"><ChevronRight className="h-6 w-6" /></Button>
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <Button variant="ghost" size="icon" className="bg-black/50" onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="bg-black/50" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="border-t border-border/40 p-4">
          <h3 className="font-heading text-lg font-semibold">{asset.title}</h3>
          {asset.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{asset.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// EXPORT COMPONENTS
// ═══════════════════════════════════════════════════════════════

w('components/export/download-menu.tsx', `'use client';
import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, FileArchive, Image as ImageIcon, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportJson, exportCsv, exportXlsx, exportPdf, exportZip, estimateFileSize } from '@/lib/export/client';
import { CLIENT_EXPORT_THRESHOLD } from '@/lib/constants';
import type { MediaAsset } from '@/types';

interface DownloadMenuProps {
  assets: MediaAsset[];
  prefix?: string;
  variant?: 'default' | 'compact';
}

export function DownloadMenu({ assets, prefix = 'export', variant = 'default' }: DownloadMenuProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(format: 'image' | 'pdf' | 'xlsx' | 'csv' | 'json' | 'zip') {
    if (assets.length === 0) { toast({ title: 'No assets to export', variant: 'destructive' }); return; }
    setLoading(format);
    try {
      const useServer = assets.length >= CLIENT_EXPORT_THRESHOLD;
      if (format === 'image' && assets.length === 1) {
        const a = assets[0]!;
        if (a.downloadUrl) { window.open(a.downloadUrl, '_blank'); }
      } else if (format === 'pdf') {
        if (useServer) {
          const res = await fetch('/api/export/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asset: assets[0] }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = \`cosmos-vault.pdf\`; a.click();
          URL.revokeObjectURL(url);
        } else {
          await exportPdf(assets[0]!);
        }
      } else if (format === 'xlsx') {
        if (useServer) {
          const res = await fetch('/api/export/xlsx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets, prefix }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = \`cosmos-vault.xlsx\`; a.click();
          URL.revokeObjectURL(url);
        } else { exportXlsx(assets, prefix); }
      } else if (format === 'csv') {
        if (useServer) {
          const res = await fetch('/api/export/csv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = \`cosmos-vault.csv\`; a.click();
          URL.revokeObjectURL(url);
        } else { exportCsv(assets, prefix); }
      } else if (format === 'json') {
        if (useServer) {
          const res = await fetch('/api/export/json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = \`cosmos-vault.json\`; a.click();
          URL.revokeObjectURL(url);
        } else { exportJson(assets, prefix); }
      } else if (format === 'zip') {
        if (useServer) {
          const res = await fetch('/api/export/zip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets, prefix }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = \`cosmos-vault.zip\`; a.click();
          URL.revokeObjectURL(url);
        } else { await exportZip(assets, prefix); }
      }
      toast({ title: 'Export complete', description: \`\${format.toUpperCase()} downloaded successfully\`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Export failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="gradient" disabled={!!loading}>
          <Download className="h-4 w-4" />
          {loading ? \`Exporting \${loading}...\` : variant === 'compact' ? '' : 'Download'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export {assets.length} asset{assets.length !== 1 ? 's' : ''}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {assets.length === 1 && assets[0]?.downloadUrl && (
          <DropdownMenuItem onClick={() => handleExport('image')}><ImageIcon className="h-4 w-4" /> Original Image</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="h-4 w-4" /> PDF Report <span className="ml-auto text-xs text-muted-foreground">{estimateFileSize(assets, 'pdf')}</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}><FileSpreadsheet className="h-4 w-4" /> Excel (XLSX) <span className="ml-auto text-xs text-muted-foreground">{estimateFileSize(assets, 'xlsx')}</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}><FileType className="h-4 w-4" /> CSV <span className="ml-auto text-xs text-muted-foreground">{estimateFileSize(assets, 'csv')}</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}><FileJson className="h-4 w-4" /> JSON <span className="ml-auto text-xs text-muted-foreground">{estimateFileSize(assets, 'json')}</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('zip')}><FileArchive className="h-4 w-4" /> ZIP (images+manifest) <span className="ml-auto text-xs text-muted-foreground">{estimateFileSize(assets, 'zip')}</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

w('components/shared/animated-counter.tsx', `'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export function AnimatedCounter({ value, duration = 2, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}
`);

w('components/shared/starfield.tsx', `'use client';
import { useEffect, useRef } from 'react';

export function Starfield({ density = 100 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; z: number; size: number }[] = [];

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < density; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random(), size: Math.random() * 1.5 });
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(5, 6, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255, 255, 255, \${star.z * 0.8})\`;
        ctx.fill();
        star.y += star.z * 0.3;
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [density]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
`);

w('components/shared/section-heading.tsx', `import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered, className }: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', centered && 'text-center', className)}>
      <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p>}
    </div>
  );
}
`);

w('components/shared/filter-chip.tsx', `'use client';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

export function FilterChip({ label, onRemove, color }: FilterChipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs', 'border-border bg-accent')} style={color ? { borderColor: color, color } : undefined}>
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-foreground/10" aria-label={\`Remove \${label}\`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
`);

w('components/shared/empty-state.tsx', `import { cn } from '@/lib/utils';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="rounded-full bg-muted p-4"><SearchX className="h-8 w-8 text-muted-foreground" /></div>
      <div>
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// STORES
// ═══════════════════════════════════════════════════════════════

w('stores/filters.ts', `'use client';
import { create } from 'zustand';
import type { MediaSource, MediaKind } from '@/types';

interface FilterState {
  query: string;
  sources: Set<MediaSource>;
  kinds: Set<MediaKind>;
  yearStart: number | null;
  yearEnd: number | null;
  rover: string | null;
  camera: string | null;
  hazardousOnly: boolean;
  sort: 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
  view: 'grid' | 'masonry' | 'list';
  setQuery: (q: string) => void;
  toggleSource: (s: MediaSource) => void;
  toggleKind: (k: MediaKind) => void;
  setYearRange: (start: number | null, end: number | null) => void;
  setRover: (r: string | null) => void;
  setCamera: (c: string | null) => void;
  setHazardousOnly: (h: boolean) => void;
  setSort: (s: FilterState['sort']) => void;
  setView: (v: FilterState['view']) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  sources: new Set(),
  kinds: new Set(),
  yearStart: null,
  yearEnd: null,
  rover: null,
  camera: null,
  hazardousOnly: false,
  sort: 'date-desc',
  view: 'grid',
  setQuery: (query) => set({ query }),
  toggleSource: (s) => set((state) => { const ns = new Set(state.sources); ns.has(s) ? ns.delete(s) : ns.add(s); return { sources: ns }; }),
  toggleKind: (k) => set((state) => { const ns = new Set(state.kinds); ns.has(k) ? ns.delete(k) : ns.add(k); return { kinds: ns }; }),
  setYearRange: (yearStart, yearEnd) => set({ yearStart, yearEnd }),
  setRover: (rover) => set({ rover }),
  setCamera: (camera) => set({ camera }),
  setHazardousOnly: (hazardousOnly) => set({ hazardousOnly }),
  setSort: (sort) => set({ sort }),
  setView: (view) => set({ view }),
  clearAll: () => set({ query: '', sources: new Set(), kinds: new Set(), yearStart: null, yearEnd: null, rover: null, camera: null, hazardousOnly: false }),
}));
`);

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

w('hooks/use-debounce.ts', `'use client';
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
`);

w('hooks/use-media-query.ts', `'use client';
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const handler = () => setMatches(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);
  return matches;
}
`);

console.log('\n✅ Components, stores, and hooks generated');
