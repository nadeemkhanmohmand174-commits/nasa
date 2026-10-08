'use client';
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
          const a = document.createElement('a'); a.href = url; a.download = `cosmos-vault.pdf`; a.click();
          URL.revokeObjectURL(url);
        } else {
          await exportPdf(assets[0]!);
        }
      } else if (format === 'xlsx') {
        if (useServer) {
          const res = await fetch('/api/export/xlsx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets, prefix }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `cosmos-vault.xlsx`; a.click();
          URL.revokeObjectURL(url);
        } else { exportXlsx(assets, prefix); }
      } else if (format === 'csv') {
        if (useServer) {
          const res = await fetch('/api/export/csv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `cosmos-vault.csv`; a.click();
          URL.revokeObjectURL(url);
        } else { exportCsv(assets, prefix); }
      } else if (format === 'json') {
        if (useServer) {
          const res = await fetch('/api/export/json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `cosmos-vault.json`; a.click();
          URL.revokeObjectURL(url);
        } else { exportJson(assets, prefix); }
      } else if (format === 'zip') {
        if (useServer) {
          const res = await fetch('/api/export/zip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets, prefix }) });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `cosmos-vault.zip`; a.click();
          URL.revokeObjectURL(url);
        } else { await exportZip(assets, prefix); }
      }
      toast({ title: 'Export complete', description: `${format.toUpperCase()} downloaded successfully`, variant: 'success' });
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
          {loading ? `Exporting ${loading}...` : variant === 'compact' ? '' : 'Download'}
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
