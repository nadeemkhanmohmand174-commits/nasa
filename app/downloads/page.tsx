'use client';
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
