'use client';
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
    queryFn: async () => { const res = await fetch(`/api/nasa/epic?date=${date}`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
  });

  const { data: imagery } = useQuery({
    queryKey: ['earth-imagery', lat, lon, date],
    queryFn: async () => { const res = await fetch(`/api/nasa/earth/imagery?lat=${lat}&lon=${lon}&date=${date}`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
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
