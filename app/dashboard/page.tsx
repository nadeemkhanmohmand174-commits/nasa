'use client';
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
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
