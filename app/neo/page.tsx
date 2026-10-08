'use client';
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
      const res = await fetch(`/api/nasa/neo/feed?start_date=${startDate}&end_date=${endDate}`);
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
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0B0F1F', border: '1px solid rgba(255,255,255,0.1)' }} formatter={(v: any, n: string) => n === 'y' ? `${v} M km` : v} />
              <Scatter data={scatterData} onClick={(d) => setSelected(d.payload)}>
                {scatterData.map((entry: any, i: number) => <Cell key={i} fill={entry.hazardous ? '#EF4444' : '#22D3EE'} />)}
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
