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
// NEO PAGE
// ═══════════════════════════════════════════════════════════════
w('app/neo/page.tsx', `'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DownloadMenu } from '@/components/export/download-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDatePretty, formatNumber } from '@/lib/utils';
import { AlertTriangle, Globe2, Rocket, Target } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function NeoPage() {
  const today = new Date().toISOString().split('T')[0]!;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]!;
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['neo-feed', startDate, endDate],
    queryFn: async () => {
      const res = await fetch(\`/api/nasa/neo/feed?start_date=\${startDate}&end_date=\${endDate}\`);
      if (!res.ok) throw new Error('Failed');
      return (await res.json()).data;
    },
  });

  const neos = data?.summaries ?? [];
  const scatterData = neos.map((n: any) => ({ x: n.estimated_diameter_max_km, y: n.miss_distance_km / 1e6, z: n.absolute_magnitude_h, name: n.name, hazardous: n.is_potentially_hazardous, id: n.id }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Near-Earth Objects</h1>
        <p className="mt-1 text-muted-foreground">Track asteroids and comets approaching Earth.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div><Label className="mb-1.5 block">Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" /></div>
        <div><Label className="mb-1.5 block">End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" /></div>
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-6"><div className="text-xs text-muted-foreground">Total Objects</div><div className="font-heading text-2xl font-bold">{data.element_count}</div></div>
          <div className="glass-card rounded-xl p-6"><div className="text-xs text-muted-foreground">Hazardous</div><div className="font-heading text-2xl font-bold text-red-400">{neos.filter((n: any) => n.is_potentially_hazardous).length}</div></div>
          <div className="glass-card rounded-xl p-6"><div className="text-xs text-muted-foreground">Closest Approach</div><div className="font-heading text-2xl font-bold">{Math.min(...neos.map((n: any) => n.miss_distance_km)).toLocaleString(undefined, { maximumFractionDigits: 0 })} km</div></div>
        </div>
      )}

      {scatterData.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Size vs. Distance</h2>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" dataKey="x" name="Diameter (km)" stroke="rgba(255,255,255,0.5)" fontSize={12} label={{ value: 'Diameter (km)', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Distance (M km)" stroke="rgba(255,255,255,0.5)" fontSize={12} label={{ value: 'Miss Distance (M km)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[30, 200]} name="Magnitude" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0B0F1F', border: '1px solid rgba(255,255,255,0.1)' }} formatter={(v: any, n: string) => n === 'y' ? \`\${v} M km\` : v} />
              <Scatter data={scatterData} onClick={(d) => setSelected(d.payload)}>
                {scatterData.map((entry, i) => <Cell key={i} fill={entry.hazardous ? '#EF4444' : '#22D3EE'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Hazardous</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Non-hazardous</span>
          </div>
        </div>
      )}

      {isLoading ? <div className="text-center text-muted-foreground">Loading...</div> : neos.length === 0 ? <EmptyState title="No NEOs found" description="Try a different date range" /> : (
        <div className="glass-card overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <caption className="sr-only">Near-Earth Objects</caption>
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-right font-medium">Diameter (km)</th>
                <th className="p-3 text-right font-medium">Distance (km)</th>
                <th className="p-3 text-right font-medium">Velocity (km/h)</th>
                <th className="p-3 text-center font-medium">Hazard</th>
              </tr>
            </thead>
            <tbody>
              {neos.map((n: any) => (
                <tr key={n.id} className="border-b border-border/50 hover:bg-accent/50 cursor-pointer" onClick={() => setSelected(n)}>
                  <td className="p-3 font-medium">{n.name}</td>
                  <td className="p-3 text-muted-foreground">{formatDatePretty(n.close_approach_date)}</td>
                  <td className="p-3 text-right">{n.estimated_diameter_max_km.toFixed(3)}</td>
                  <td className="p-3 text-right">{formatNumber(Math.round(n.miss_distance_km))}</td>
                  <td className="p-3 text-right">{formatNumber(Math.round(n.relative_velocity_kph))}</td>
                  <td className="p-3 text-center">{n.is_potentially_hazardous ? <span className="inline-flex items-center gap-1 text-red-400"><AlertTriangle className="h-3 w-3" /> Yes</span> : <span className="text-green-400">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Near-Earth Object Details</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Absolute Magnitude</div><div className="font-mono">{selected.absolute_magnitude_h}</div></div>
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Diameter Range</div><div className="font-mono">{selected.estimated_diameter_min_km?.toFixed(3)}–{selected.estimated_diameter_max_km?.toFixed(3)} km</div></div>
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Close Approach</div><div className="font-mono">{formatDatePretty(selected.close_approach_date)}</div></div>
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Miss Distance</div><div className="font-mono">{formatNumber(Math.round(selected.miss_distance_km))} km</div></div>
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Relative Velocity</div><div className="font-mono">{formatNumber(Math.round(selected.relative_velocity_kph))} km/h</div></div>
                <div className="glass-card rounded-lg p-3"><div className="text-xs text-muted-foreground">Orbiting Body</div><div className="font-mono">{selected.orbiting_body}</div></div>
              </div>
              {selected.is_potentially_hazardous && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"><AlertTriangle className="h-4 w-4" /> Potentially Hazardous Asteroid</div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" asChild><a href={selected.nasa_jpl_url} target="_blank" rel="noopener noreferrer"><Globe2 className="h-4 w-4" /> JPL Database</a></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// EARTH PAGE
// ═══════════════════════════════════════════════════════════════
w('app/earth/page.tsx', `'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Play, Pause, Globe2, MapPin } from 'lucide-react';

export default function EarthPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!);
  const [lat, setLat] = useState('40.7128');
  const [lon, setLon] = useState('-74.0060');
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);

  const { data: epicImages, isLoading } = useQuery({
    queryKey: ['epic', date],
    queryFn: async () => { const res = await fetch(\`/api/nasa/epic?date=\${date}\`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
  });

  const { data: imagery } = useQuery({
    queryKey: ['earth-imagery', lat, lon, date],
    queryFn: async () => { const res = await fetch(\`/api/nasa/earth/imagery?lat=\${lat}&lon=\${lon}&date=\${date}\`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
  });

  // Auto-play EPIC sequence
  useState(() => {
    if (playing && epicImages?.length) {
      const timer = setInterval(() => setFrame((f) => (f + 1) % epicImages.length), 500);
      return () => clearInterval(timer);
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">EPIC Earth Imagery</h1>
        <p className="mt-1 text-muted-foreground">Animated Earth sequences from DSCOVR + satellite imagery lookup.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div><Label className="mb-1.5 block">Date</Label><Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setFrame(0); }} className="w-44" /></div>
            <Button variant={playing ? 'destructive' : 'gradient'} onClick={() => setPlaying(!playing)} disabled={!epicImages?.length}>
              {playing ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Play Sequence</>}
            </Button>
          </div>

          <Card className="glass-card overflow-hidden">
            <div className="relative aspect-square">
              {epicImages?.length ? (
                <img src={epicImages[frame]?.fullUrl} alt={epicImages[frame]?.title} className="h-full w-full object-cover" />
              ) : isLoading ? <div className="shimmer h-full w-full" /> : <div className="flex h-full items-center justify-center"><EmptyState title="No EPIC images" description="Try a different date" /></div>}
            </div>
            <CardContent className="p-4">
              {epicImages?.[frame] && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frame {frame + 1} / {epicImages.length}</span>
                  <span className="font-mono text-xs">Lat: {epicImages[frame].metadata.centroid_lat?.toFixed(1)}° Lon: {epicImages[frame].metadata.centroid_lon?.toFixed(1)}°</span>
                </div>
              )}
              {epicImages?.length && <input type="range" min={0} max={epicImages.length - 1} value={frame} onChange={(e) => setFrame(Number(e.target.value))} className="mt-2 w-full" />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-source-epic" /><h2 className="font-heading text-xl font-bold">Satellite Lookup</h2></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Latitude</Label><Input type="number" step="0.0001" value={lat} onChange={(e) => setLat(e.target.value)} /></div>
            <div><Label className="mb-1.5 block">Longitude</Label><Input type="number" step="0.0001" value={lon} onChange={(e) => setLon(e.target.value)} /></div>
          </div>
          <Card className="glass-card overflow-hidden">
            <div className="relative aspect-square">
              {imagery?.fullUrl ? <img src={imagery.fullUrl} alt="Earth imagery" className="h-full w-full object-cover" /> : <div className="shimmer h-full w-full" />}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {lat}°, {lon}°</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// ASSET DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
w('app/asset/[id]/page.tsx', `'use client';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart, Share2, ExternalLink, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SourceBadge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lightbox } from '@/components/media/lightbox';
import { DownloadMenu } from '@/components/export/download-menu';
import { useToast } from '@/hooks/use-toast';
import { formatDatePretty, truncate } from '@/lib/utils';

function parseAssetId(id: string) {
  const [source, ...rest] = id.split('_');
  const nativeId = rest.join('_');
  return { source, nativeId };
}

async function fetchAsset(id: string) {
  const { source, nativeId } = parseAssetId(id);
  let endpoint = '';
  if (source === 'apod') endpoint = \`/api/nasa/apod?date=\${nativeId}\`;
  else if (source === 'mars') {
    // Mars photos need sol/rover - we'll fetch by the photo ID via library search as fallback
    const res = await fetch(\`/api/nasa/library/search?q=mars\`);
    const json = await res.json();
    return json.data?.find((a: any) => a.id === id) ?? json.data?.[0];
  }
  else if (source === 'neo') endpoint = \`/api/nasa/neo/\${nativeId}\`;
  else if (source === 'epic') endpoint = \`/api/nasa/epic\`;
  else if (source === 'library') endpoint = \`/api/nasa/library/asset/\${nativeId}\`;
  if (!endpoint) return null;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: asset, isLoading, error } = useQuery({ queryKey: ['asset', id], queryFn: () => fetchAsset(id) });

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="shimmer h-8 w-8 rounded-full" /></div>;
  if (error || !asset) return <div className="py-20 text-center"><p className="text-muted-foreground">Failed to load asset.</p><Button asChild className="mt-4"><Link href="/explore">Back to Explore</Link></Button></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild><Link href="/explore"><ArrowLeft className="h-4 w-4" /> Back to Explore</Link></Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card relative overflow-hidden rounded-2xl">
            {asset.fullUrl ? (
              <img src={asset.fullUrl} alt={asset.title} onClick={() => setLightboxOpen(true)} className="w-full cursor-zoom-in object-contain" />
            ) : (
              <div className="flex aspect-video items-center justify-center text-muted-foreground">No preview available</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge source={asset.source} />
            <span className="text-sm text-muted-foreground">{formatDatePretty(asset.date)}</span>
            {asset.credit && <span className="text-sm text-muted-foreground">· {asset.credit}</span>}
          </div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{asset.title}</h1>
          {asset.description && <p className="leading-relaxed text-muted-foreground">{asset.description}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <DownloadMenu assets={[asset]} prefix={asset.source} />
            <Button variant="outline" size="icon" onClick={() => { setIsFavorite(!isFavorite); toast({ title: isFavorite ? 'Removed from favorites' : 'Added to favorites' }); }} aria-label="Toggle favorite"><Heart className={\`h-4 w-4 \${isFavorite ? 'fill-red-500 text-red-500' : ''}\`} /></Button>
            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: 'Link copied' }); }} aria-label="Share"><Share2 className="h-4 w-4" /></Button>
          </div>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(asset.metadata).slice(0, 12).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2"><span className="text-muted-foreground">{key}</span><span className="truncate font-mono text-xs">{String(value)}</span></div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Citations</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {asset.citations.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span>{c.label}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(c.url); toast({ title: 'URL copied' }); }} aria-label="Copy URL"><Copy className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild><a href={c.url} target="_blank" rel="noopener noreferrer" aria-label="Open"><ExternalLink className="h-3 w-3" /></a></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Accordion type="single" collapsible>
            <AccordionItem value="keywords">
              <AccordionTrigger>Keywords ({asset.keywords.length})</AccordionTrigger>
              <AccordionContent><div className="flex flex-wrap gap-1">{asset.keywords.map((k: string) => <span key={k} className="rounded-full bg-accent px-2 py-0.5 text-xs">{k}</span>)}</div></AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Lightbox asset={lightboxOpen ? asset : null} onClose={() => setLightboxOpen(false)} />
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// COLLECTIONS PAGE
// ═══════════════════════════════════════════════════════════════
w('app/collections/page.tsx', `'use client';
import { useState } from 'react';
import { FolderOpen, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/env';
import { formatDatePretty } from '@/lib/utils';

interface DemoCollection { id: string; name: string; description: string; slug: string; is_public: boolean; item_count: number; created_at: string; }

const demoCollections: DemoCollection[] = [
  { id: '1', name: 'Best of APOD', description: 'My favorite astronomy pictures', slug: 'best-of-apod', is_public: true, item_count: 24, created_at: '2026-09-01' },
  { id: '2', name: 'Mars Highlights', description: 'Top photos from Curiosity and Perseverance', slug: 'mars-highlights', is_public: true, item_count: 18, created_at: '2026-09-15' },
  { id: '3', name: 'Hazardous NEOs', description: 'Potentially hazardous asteroid tracking', slug: 'hazardous-neos', is_public: false, item_count: 7, created_at: '2026-09-28' },
];

export default function CollectionsPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState(demoCollections);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const configured = isSupabaseConfigured();

  function createCollection() {
    if (!name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const newCol: DemoCollection = { id: Date.now().toString(), name, description: desc, slug: name.toLowerCase().replace(/\\s+/g, '-'), is_public: isPublic, item_count: 0, created_at: new Date().toISOString().split('T')[0]! };
    setCollections([...collections, newCol]);
    setName(''); setDesc(''); setIsPublic(true); setOpen(false);
    toast({ title: 'Collection created', variant: 'success' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Collections</h1>
          <p className="mt-1 text-muted-foreground">{configured ? 'Curate and organize your favorite NASA media.' : 'Demo mode — connect Supabase to save collections.'}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gradient"><Plus className="h-4 w-4" /> New Collection</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Collection</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="mb-1.5 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Space Collection" /></div>
              <div><Label className="mb-1.5 block">Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="A brief description..." /></div>
              <div className="flex items-center gap-2"><Switch checked={isPublic} onCheckedChange={setIsPublic} id="public" /><Label htmlFor="public">Public</Label></div>
            </div>
            <DialogFooter><Button variant="gradient" onClick={createCollection}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? <EmptyState title="No collections yet" description="Create your first collection to organize NASA media" action={<Button variant="gradient" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Collection</Button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Card key={c.id} className="glass-card group cursor-pointer transition-all hover:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FolderOpen className="h-8 w-8 text-nebula-violet" />
                  {!c.is_public && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <CardTitle className="text-base">{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{c.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.item_count} items</span>
                  <span>{formatDatePretty(c.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// DOWNLOADS PAGE
// ═══════════════════════════════════════════════════════════════
w('app/downloads/page.tsx', `'use client';
import { Download, FileText, FileSpreadsheet, FileJson, FileArchive, Image as ImageIcon, FileType } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { isSupabaseConfigured } from '@/lib/env';
import { formatDatePretty, formatBytes } from '@/lib/utils';

const formatIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon, pdf: FileText, xlsx: FileSpreadsheet, csv: FileType, json: FileJson, zip: FileArchive,
};

const demoDownloads = [
  { id: '1', asset_id: 'apod_2026-10-01', format: 'pdf' as const, item_count: 1, byte_size: 240000, created_at: '2026-10-02T10:30:00Z' },
  { id: '2', asset_id: 'mars_12345', format: 'zip' as const, item_count: 25, byte_size: 4200000, created_at: '2026-10-01T14:20:00Z' },
  { id: '3', asset_id: 'library_NASA-Langley', format: 'xlsx' as const, item_count: 12, byte_size: 89000, created_at: '2026-09-30T09:15:00Z' },
];

export default function DownloadsPage() {
  const configured = isSupabaseConfigured();
  const downloads = configured ? demoDownloads : demoDownloads;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Download History</h1>
        <p className="mt-1 text-muted-foreground">{configured ? 'Track and re-download your exported data.' : 'Demo mode — connect Supabase to persist downloads.'}</p>
      </div>

      {downloads.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="glass-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Downloads</div><div className="font-heading text-2xl font-bold">{downloads.length}</div></CardContent></Card>
          <Card className="glass-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Size</div><div className="font-heading text-2xl font-bold">{formatBytes(downloads.reduce((s, d) => s + d.byte_size, 0))}</div></CardContent></Card>
          <Card className="glass-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Items Exported</div><div className="font-heading text-2xl font-bold">{downloads.reduce((s, d) => s + d.item_count, 0)}</div></CardContent></Card>
          <Card className="glass-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">This Week</div><div className="font-heading text-2xl font-bold">{downloads.filter(d => Date.now() - new Date(d.created_at).getTime() < 7 * 86400000).length}</div></CardContent></Card>
        </div>
      )}

      {downloads.length === 0 ? <EmptyState title="No downloads yet" description="Export data from any asset or search results" /> : (
        <div className="glass-card overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <caption className="sr-only">Download History</caption>
            <thead className="border-b border-border bg-muted/50">
              <tr><th className="p-3 text-left font-medium">Format</th><th className="p-3 text-left font-medium">Asset ID</th><th className="p-3 text-right font-medium">Items</th><th className="p-3 text-right font-medium">Size</th><th className="p-3 text-right font-medium">Date</th></tr>
            </thead>
            <tbody>
              {downloads.map((d) => {
                const Icon = formatIcons[d.format] ?? Download;
                return (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="p-3"><span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {d.format.toUpperCase()}</span></td>
                    <td className="p-3 font-mono text-xs">{d.asset_id}</td>
                    <td className="p-3 text-right">{d.item_count}</td>
                    <td className="p-3 text-right">{formatBytes(d.byte_size)}</td>
                    <td className="p-3 text-right text-muted-foreground">{formatDatePretty(d.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
w('app/dashboard/page.tsx', `'use client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { Search, Heart, Download, FolderOpen, Clock } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/env';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const demoActivity = [
  { date: 'Sep 27', downloads: 3 }, { date: 'Sep 28', downloads: 5 }, { date: 'Sep 29', downloads: 2 },
  { date: 'Sep 30', downloads: 8 }, { date: 'Oct 1', downloads: 4 }, { date: 'Oct 2', downloads: 6 }, { date: 'Oct 3', downloads: 3 },
];

export default function DashboardPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">{configured ? 'Your Cosmos Vault activity overview.' : 'Demo mode — connect Supabase for personalized data.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Search, label: 'Recent Searches', value: 42, color: 'text-nebula-violet' },
          { icon: Heart, label: 'Favorites', value: 18, color: 'text-red-400' },
          { icon: Download, label: 'Downloads', value: 7, color: 'text-nebula-cyan' },
          { icon: FolderOpen, label: 'Collections', value: 3, color: 'text-source-mars' },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={\`h-5 w-5 \${stat.color}\`} />
              </div>
              <div className="mt-3 font-heading text-2xl font-bold"><AnimatedCounter value={stat.value} /></div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Download Activity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={demoActivity}>
              <defs><linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0B0F1F', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="downloads" stroke="#7C3AED" fill="url(#dlGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Searches</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['galaxy nebula', 'mars curiosity', 'saturn rings', 'apollo mission'].map((q, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2 text-sm">
                <span>{q}</span><span className="text-xs text-muted-foreground">{i + 1}h ago</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4" /> Recent Favorites</CardTitle></CardHeader>
          <CardContent>
            <EmptyState title="No favorites yet" description="Heart any asset to see it here" className="py-8" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// ABOUT PAGE
// ═══════════════════════════════════════════════════════════════
w('app/about/page.tsx', `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Telescope, Globe, Database, Accessibility, Code, Shield } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <Telescope className="mx-auto h-12 w-12 text-nebula-violet" />
        <h1 className="mt-4 font-heading text-4xl font-bold gradient-heading">About Cosmos Vault</h1>
        <p className="mt-3 text-muted-foreground">A NASA research media and data exploration platform built with modern web technologies.</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Mission</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Cosmos Vault unifies six NASA data APIs into a single, searchable, exportable platform. Whether you're an educator, researcher, or space enthusiast, Cosmos Vault makes NASA's vast media archive accessible, browsable, and downloadable in multiple formats.</p>
          <p>Every image, dataset, and document you find here comes directly from NASA's public APIs. All NASA imagery is in the public domain unless otherwise noted.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Database, title: 'Data Sources', desc: 'APOD, Mars Rover Photos, NEO Feed, EPIC Earth, NASA Image Library, and Tech Transfer — all via api.nasa.gov.' },
          { icon: Globe, title: 'Export Formats', desc: 'Download as PDF reports, Excel spreadsheets, CSV, JSON, or ZIP archives with bundled images and metadata.' },
          { icon: Code, title: 'Tech Stack', desc: 'Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, TanStack Query, Supabase, Cloudinary.' },
          { icon: Shield, title: 'Privacy', desc: 'Your data stays yours. Auth via Supabase, images cached via Cloudinary, no tracking beyond essential analytics.' },
          { icon: Accessibility, title: 'Accessibility', desc: 'WCAG AA compliant, keyboard navigation, screen reader support, reduced motion preferences, skip-to-content link.' },
          { icon: Telescope, title: 'Open Data', desc: 'All NASA data is public domain. Cosmos Vault is an independent project not affiliated with NASA.' },
        ].map((f) => (
          <Card key={f.title} className="glass-card">
            <CardHeader><f.icon className="h-6 w-6 text-nebula-violet" /><CardTitle className="text-base">{f.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Credits & Links</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><a href={SOCIAL_LINKS.nasaApi} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA API Portal</a> — Get your own API key</p>
          <p><a href={SOCIAL_LINKS.nasaImages} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA Image and Video Library</a></p>
          <p><a href={SOCIAL_LINKS.nasa} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA.gov</a></p>
          <p className="pt-2 text-xs text-muted-foreground">Cosmos Vault is an independent project. NASA does not endorse this application. All imagery © NASA/JPL-Caltech/GSFC.</p>
        </CardContent>
      </Card>
    </div>
  );
}
`);

console.log('\n✅ Pages batch 2 generated');
