'use client';
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
  const params = date ? `?date=${date}` : '';
  const res = await fetch(`/api/nasa/apod${params}`);
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data;
}

async function fetchRange(start: string, end: string) {
  const res = await fetch(`/api/nasa/apod/range?start_date=${start}&end_date=${end}`);
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
                <DownloadMenu assets={[apod]} prefix={`apod-${apod.date}`} />
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
