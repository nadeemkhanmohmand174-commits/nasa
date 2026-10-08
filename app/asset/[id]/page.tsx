'use client';
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
  if (source === 'apod') endpoint = `/api/nasa/apod?date=${nativeId}`;
  else if (source === 'mars') {
    // Mars photos need sol/rover - we'll fetch by the photo ID via library search as fallback
    const res = await fetch(`/api/nasa/library/search?q=mars`);
    const json = await res.json();
    return json.data?.find((a: any) => a.id === id) ?? json.data?.[0];
  }
  else if (source === 'neo') endpoint = `/api/nasa/neo/${nativeId}`;
  else if (source === 'epic') endpoint = `/api/nasa/epic`;
  else if (source === 'library') endpoint = `/api/nasa/library/asset/${nativeId}`;
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
            <Button variant="outline" size="icon" onClick={() => { setIsFavorite(!isFavorite); toast({ title: isFavorite ? 'Removed from favorites' : 'Added to favorites' }); }} aria-label="Toggle favorite"><Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} /></Button>
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
