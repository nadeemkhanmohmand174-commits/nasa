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
// APP LAYOUT (with sidebar)
// ═══════════════════════════════════════════════════════════════
w('app/(app)/layout.tsx', `import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container mx-auto flex px-0">
        <Sidebar />
        <main id="main-content" className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <Footer />
      <MobileTabBar />
    </>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// HOME PAGE (marketing)
// ═══════════════════════════════════════════════════════════════
w('app/(marketing)/page.tsx', `'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Telescope, Star, Orbit, Asteroid, Globe, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Starfield } from '@/components/shared/starfield';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { SectionHeading } from '@/components/shared/section-heading';
import { MediaCard } from '@/components/media/media-card';

async function fetchApod() {
  const res = await fetch('/api/nasa/apod');
  if (!res.ok) throw new Error('Failed to fetch APOD');
  const json = await res.json();
  return json.data;
}

async function fetchApodRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const res = await fetch(\`/api/nasa/apod/range?start_date=\${fmt(start)}&end_date=\${fmt(end)}\`);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

const features = [
  { icon: Star, title: 'Astronomy Picture of the Day', description: 'Browse NASA\\'s daily astronomical images with calendar heatmap, range explorer, and random discovery.', href: '/apod', color: 'text-nebula-violet' },
  { icon: Orbit, title: 'Mars Rover Photos', description: 'Explore photos from Curiosity, Opportunity, Spirit, and Perseverance filtered by sol and camera.', href: '/mars', color: 'text-source-mars' },
  { icon: Asteroid, title: 'Near-Earth Objects', description: 'Track asteroids with size-distance scatter plots, hazard color-coding, and orbital data.', href: '/neo', color: 'text-source-neo' },
  { icon: Globe, title: 'EPIC Earth Imagery', description: 'Watch animated Earth sequences from DSCOVR and lookup satellite imagery by coordinates.', href: '/earth', color: 'text-source-epic' },
];

export default function HomePage() {
  const { data: apod, isLoading } = useQuery({ queryKey: ['apod'], queryFn: fetchApod });
  const { data: recent } = useQuery({ queryKey: ['apod-range'], queryFn: fetchApodRange });

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <Starfield density={150} />
        <div className="aurora-bg" />
        {apod?.fullUrl && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={apod.fullUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="container relative z-10 mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-nebula-violet/30 bg-nebula-violet/10 px-4 py-1.5 text-sm text-nebula-violet">
              <Sparkles className="h-4 w-4" />
              Powered by NASA APIs
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              <span className="gradient-heading">COSMOS</span>
              <br />
              <span className="text-foreground">VAULT</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Explore NASA\\'s vast research media archive — from daily astronomy pictures and Mars rover photos to near-Earth objects and EPIC Earth imagery. Search, filter, collect, and export mission data.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" asChild>
                <Link href="/explore"><Zap className="h-5 w-5" /> Start Exploring <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/apod"><Star className="h-5 w-5" /> Today\\'s APOD</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-[var(--bg-elevated)] py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {[
            { label: 'NASA Data Sources', value: 6, suffix: '' },
            { label: 'Mars Rover Photos', value: 1000000, suffix: '+' },
            { label: 'NEO Tracked', value: 30000, suffix: '+' },
            { label: 'Export Formats', value: 6, suffix: '' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-bold gradient-heading md:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's APOD */}
      {apod && (
        <section className="container mx-auto px-4 py-16">
          <SectionHeading title="Today's Picture" subtitle="Astronomy Picture of the Day from NASA" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="glass-card overflow-hidden rounded-2xl">
              {apod.fullUrl && <img src={apod.fullUrl} alt={apod.title} className="aspect-video w-full object-cover" />}
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-nebula-violet/10 px-3 py-1 text-xs text-nebula-violet">APOD · {apod.date}</div>
              <h3 className="font-heading text-2xl font-bold">{apod.title}</h3>
              <p className="mt-3 line-clamp-6 text-sm text-muted-foreground">{apod.description}</p>
              <Button variant="gradient" className="mt-6 w-fit" asChild>
                <Link href={\`/asset/\${apod.id}\`}>View Details <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Feature cards */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title="Explore the Cosmos" subtitle="Six powerful data exploration modules backed by real NASA APIs" centered />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={feature.href}>
                <Card className="group glass-card h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <feature.icon className={\`h-10 w-10 \${feature.color}\`} />
                    <CardTitle className="mt-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest strip */}
      {recent && recent.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <SectionHeading title="Latest from APOD" subtitle="The last 7 days of astronomy pictures" />
            <Button variant="outline" asChild className="hidden sm:flex"><Link href="/apod">View All <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {recent.slice(0, 6).map((asset: any, i: number) => (
              <MediaCard key={asset.id} asset={asset} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="conic-border relative overflow-hidden rounded-2xl p-8 text-center md:p-16">
          <Telescope className="mx-auto h-12 w-12 text-nebula-violet" />
          <h2 className="mt-4 font-heading text-3xl font-bold">Ready to explore the universe?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Search across NASA's entire media archive, build collections, and export data in six formats.</p>
          <Button variant="gradient" size="lg" className="mt-6" asChild>
            <Link href="/explore">Launch Explorer <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// EXPLORE PAGE
// ═══════════════════════════════════════════════════════════════
w('app/explore/page.tsx', `'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutGrid, Rows3, Columns3, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { DownloadMenu } from '@/components/export/download-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { FilterChip } from '@/components/shared/filter-chip';
import { useDebounce } from '@/hooks/use-debounce';
import { useFilterStore } from '@/stores/filters';
import { SOURCE_LABELS, KIND_LABELS } from '@/lib/constants';
import type { MediaSource, MediaKind } from '@/types';
import { cn } from '@/lib/utils';

const SOURCES: MediaSource[] = ['apod', 'mars', 'neo', 'epic', 'library', 'techtransfer'];
const KINDS: MediaKind[] = ['image', 'video', 'audio', 'dataset', 'document'];

export default function ExplorePage() {
  const filters = useFilterStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedQuery = useDebounce(filters.query, 400);

  // Primary search via NASA Library
  const { data, isLoading, error } = useQuery({
    queryKey: ['explore', debouncedQuery, filters.sources],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      params.set('media_type', 'image');
      const res = await fetch(\`/api/nasa/library/search?\${params}\`);
      if (!res.ok) throw new Error('Search failed');
      const json = await res.json();
      return json.data as any[];
    },
    enabled: debouncedQuery.length > 0,
  });

  const assets = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (filters.sources.size > 0) result = result.filter((a) => filters.sources.has(a.source));
    if (filters.kinds.size > 0) result = result.filter((a) => filters.kinds.has(a.kind));
    if (filters.yearStart) result = result.filter((a) => parseInt(a.date?.slice(0, 4) ?? '0') >= filters.yearStart!);
    if (filters.yearEnd) result = result.filter((a) => parseInt(a.date?.slice(0, 4) ?? '0') <= filters.yearEnd!);
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'date-asc': return (a.date ?? '').localeCompare(b.date ?? '');
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        default: return (b.date ?? '').localeCompare(a.date ?? '');
      }
    });
    return result;
  }, [data, filters.sources, filters.kinds, filters.yearStart, filters.yearEnd, filters.sort]);

  const selectedAssets = assets.filter((a) => selected.has(a.id));
  const activeChips = [
    ...Array.from(filters.sources).map((s) => ({ label: SOURCE_LABELS[s], onRemove: () => filters.toggleSource(s) })),
    ...Array.from(filters.kinds).map((k) => ({ label: KIND_LABELS[k], onRemove: () => filters.toggleKind(k) })),
    ...(filters.yearStart ? [{ label: \`From \${filters.yearStart}\`, onRemove: () => filters.setYearRange(null, filters.yearEnd) }] : []),
    ...(filters.yearEnd ? [{ label: \`To \${filters.yearEnd}\`, onRemove: () => filters.setYearRange(filters.yearStart, null) }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Explore NASA Media</h1>
        <p className="mt-1 text-muted-foreground">Search across the NASA image library with advanced filters.</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search for galaxies, planets, missions..." value={filters.query} onChange={(e) => filters.setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.sort} onValueChange={(v) => filters.setSort(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-border">
            <Button variant={filters.view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('grid')} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={filters.view === 'masonry' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('masonry')} aria-label="Masonry view"><Columns3 className="h-4 w-4" /></Button>
            <Button variant={filters.view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('list')} aria-label="List view"><Rows3 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </summary>
          <div className="absolute z-50 mt-2 w-64 rounded-md border border-border bg-popover p-4 shadow-lg">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs uppercase text-muted-foreground">Source</Label>
                <div className="space-y-2">
                  {SOURCES.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox checked={filters.sources.has(s)} onCheckedChange={() => filters.toggleSource(s)} id={\`src-\${s}\`} />
                      <Label htmlFor={\`src-\${s}\`} className="text-sm">{SOURCE_LABELS[s]}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-xs uppercase text-muted-foreground">Type</Label>
                <div className="space-y-2">
                  {KINDS.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <Checkbox checked={filters.kinds.has(k)} onCheckedChange={() => filters.toggleKind(k)} id={\`kind-\${k}\`} />
                      <Label htmlFor={\`kind-\${k}\`} className="text-sm">{KIND_LABELS[k]}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>
        {activeChips.map((chip, i) => <FilterChip key={i} {...chip} />)}
        {activeChips.length > 0 && <Button variant="ghost" size="sm" onClick={() => filters.clearAll()}><X className="h-3 w-3" /> Clear all</Button>}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-30 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 backdrop-blur">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <DownloadMenu assets={selectedAssets} prefix="bulk-export" variant="compact" />
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {isLoading ? <MediaSkeleton /> : error ? <EmptyState title="Search failed" description="Please try again" /> : assets.length === 0 && debouncedQuery ? <EmptyState title="No results" description="Try a different search term" /> : assets.length === 0 ? <EmptyState title="Start searching" description="Enter a query above to explore NASA's media archive" action={<Button variant="gradient" onClick={() => filters.setQuery('galaxy')}>Try "galaxy"</Button>} : (
        <MediaGrid assets={assets} variant={filters.view} onFavorite={(a) => { const ns = new Set(selected); ns.has(a.id) ? ns.delete(a.id) : ns.add(a.id); setSelected(ns); }} favorites={selected} />
      )}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// APOD PAGE
// ═══════════════════════════════════════════════════════════════
w('app/apod/page.tsx', `'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Shuffle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SourceBadge } from '@/components/ui/badge';
import { DownloadMenu } from '@/components/export/download-menu';
import { MediaCard } from '@/components/media/media-card';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDatePretty, formatDate } from '@/lib/utils';

async function fetchApod(date?: string) {
  const params = date ? \`?date=\${date}\` : '';
  const res = await fetch(\`/api/nasa/apod\${params}\`);
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data;
}

async function fetchRange(start: string, end: string) {
  const res = await fetch(\`/api/nasa/apod/range?start_date=\${start}&end_date=\${end}\`);
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data;
}

export default function ApodPage() {
  const today = new Date().toISOString().split('T')[0]!;
  const [date, setDate] = useState(today);
  const [rangeStart, setRangeStart] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]!);
  const [rangeEnd, setRangeEnd] = useState(today);

  const { data: apod, isLoading, error } = useQuery({ queryKey: ['apod', date], queryFn: () => fetchApod(date) });
  const { data: rangeData, isLoading: rangeLoading } = useQuery({ queryKey: ['apod-range', rangeStart, rangeEnd], queryFn: () => fetchRange(rangeStart, rangeEnd) });

  function randomDate() {
    const start = new Date('1995-06-16').getTime();
    const end = new Date().getTime();
    const random = new Date(start + Math.random() * (end - start));
    setDate(random.toISOString().split('T')[0]!);
  }

  function shiftDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    const next = d.toISOString().split('T')[0]!;
    if (next <= today && next >= '1995-06-16') setDate(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Astronomy Picture of the Day</h1>
        <p className="mt-1 text-muted-foreground">Discover NASA's daily curated astronomical images since 1995.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label htmlFor="date" className="mb-1.5 block">Date</Label>
          <Input id="date" type="date" value={date} min="1995-06-16" max={today} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
        <Button variant="outline" onClick={() => shiftDate(-1)}><ArrowLeft className="h-4 w-4" /> Prev</Button>
        <Button variant="outline" onClick={() => shiftDate(1)}>Next <ArrowRight className="h-4 w-4" /></Button>
        <Button variant="gradient" onClick={randomDate}><Shuffle className="h-4 w-4" /> Random</Button>
        <Button variant="ghost" onClick={() => setDate(today)}><Calendar className="h-4 w-4" /> Today</Button>
      </div>

      {isLoading ? <MediaSkeleton count={1} /> : error ? <EmptyState title="Failed to load" /> : apod && (
        <Card className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto">
              {apod.kind === 'video' ? (
                <iframe src={apod.fullUrl} className="h-full min-h-[300px] w-full" allowFullScreen title={apod.title} />
              ) : (
                <img src={apod.fullUrl} alt={apod.title} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-col p-6">
              <div className="mb-2 flex items-center gap-2">
                <SourceBadge source="apod" />
                <span className="text-sm text-muted-foreground">{formatDatePretty(apod.date)}</span>
              </div>
              <h2 className="font-heading text-2xl font-bold">{apod.title}</h2>
              {apod.credit && <p className="mt-1 text-sm text-muted-foreground">Credit: {apod.credit}</p>}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{apod.description}</p>
              <div className="mt-6 flex gap-2">
                <DownloadMenu assets={[apod]} prefix={\`apod-\${apod.date}\`} />
                <Button variant="outline" asChild><a href={apod.fullUrl} target="_blank" rel="noopener noreferrer">View Original</a></Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-4 font-heading text-xl font-bold">Range Explorer</h2>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div><Label className="mb-1.5 block">From</Label><Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="w-44" /></div>
          <div><Label className="mb-1.5 block">To</Label><Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="w-44" /></div>
        </div>
        {rangeLoading ? <MediaSkeleton count={6} /> : rangeData && rangeData.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{rangeData.map((a: any, i: number) => <MediaCard key={a.id} asset={a} index={i} />)}</div>
        ) : <EmptyState title="No images in range" />}
      </div>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// MARS PAGE
// ═══════════════════════════════════════════════════════════════
w('app/mars/page.tsx', `'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MediaCard } from '@/components/media/media-card';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { DownloadMenu } from '@/components/export/download-menu';
import { ROVERS, CAMERAS } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MarsPage() {
  const [rover, setRover] = useState('curiosity');
  const [sol, setSol] = useState(1000);
  const [camera, setCamera] = useState<string>('all');

  const { data: manifest } = useQuery({
    queryKey: ['mars-manifest', rover],
    queryFn: async () => { const res = await fetch(\`/api/nasa/mars/manifest?rover=\${rover}\`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
  });

  const { data: photos, isLoading } = useQuery({
    queryKey: ['mars-photos', rover, sol, camera],
    queryFn: async () => {
      const params = new URLSearchParams({ rover, sol: String(sol) });
      if (camera !== 'all') params.set('camera', camera);
      const res = await fetch(\`/api/nasa/mars/photos?\${params}\`);
      if (!res.ok) throw new Error('fail');
      return (await res.json()).data;
    },
  });

  const chartData = manifest?.photos?.slice(-20).map((p: any) => ({ sol: p.sol, photos: p.total_photos })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Mars Rover Photos</h1>
        <p className="mt-1 text-muted-foreground">Browse photos from NASA's Mars Exploration Rovers.</p>
      </div>

      {manifest && (
        <div className="glass-card grid gap-4 rounded-xl p-6 sm:grid-cols-4">
          <div><div className="text-xs text-muted-foreground">Rover</div><div className="font-heading text-xl font-bold capitalize">{manifest.name}</div></div>
          <div><div className="text-xs text-muted-foreground">Status</div><div className="font-heading text-xl font-bold capitalize text-green-400">{manifest.status}</div></div>
          <div><div className="text-xs text-muted-foreground">Landing Date</div><div className="font-heading text-xl font-bold">{manifest.landing_date}</div></div>
          <div><div className="text-xs text-muted-foreground">Total Photos</div><div className="font-heading text-xl font-bold">{manifest.total_photos?.toLocaleString()}</div></div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Photos per Sol (last 20 sols)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="sol" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0B0F1F', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="photos" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div><Label className="mb-1.5 block">Rover</Label>
          <Select value={rover} onValueChange={(v) => { setRover(v); setSol(1000); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{ROVERS.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="mb-1.5 block">Sol (Mars day)</Label><Input type="number" value={sol} min={0} max={manifest?.max_sol ?? 5000} onChange={(e) => setSol(Number(e.target.value))} className="w-32" /></div>
        <div><Label className="mb-1.5 block">Camera</Label>
          <Select value={camera} onValueChange={setCamera}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cameras</SelectItem>
              {CAMERAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {photos && photos.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{photos.length} photos on Sol {sol}</p>
          <DownloadMenu assets={photos.slice(0, 50)} prefix={\`mars-\${rover}-sol-\${sol}\`} />
        </div>
      )}

      {isLoading ? <MediaSkeleton /> : photos && photos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.slice(0, 24).map((a: any, i: number) => <MediaCard key={a.id} asset={a} index={i} />)}
        </div>
      ) : <EmptyState title="No photos" description="Try a different sol or camera" />}
    </div>
  );
}
`);

console.log('\n✅ Pages batch 1 generated');
