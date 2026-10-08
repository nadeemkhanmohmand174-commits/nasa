'use client';
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
    queryFn: async () => { const res = await fetch(`/api/nasa/mars/manifest?rover=${rover}`); if (!res.ok) throw new Error('fail'); return (await res.json()).data; },
  });

  const { data: photos, isLoading } = useQuery({
    queryKey: ['mars-photos', rover, sol, camera],
    queryFn: async () => {
      const params = new URLSearchParams({ rover, sol: String(sol) });
      if (camera !== 'all') params.set('camera', camera);
      const res = await fetch(`/api/nasa/mars/photos?${params}`);
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
          <DownloadMenu assets={photos.slice(0, 50)} prefix={`mars-${rover}-sol-${sol}`} />
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
