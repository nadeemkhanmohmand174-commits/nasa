import type { MediaAsset } from '@/types';
import { buildFilename, slugify, formatBytes } from '@/lib/utils';
import { SOURCE_COLORS, ZIP_IMAGE_CAP } from '@/lib/constants';

/**
 * Client-side export utilities.
 * Used for exports under the CLIENT_EXPORT_THRESHOLD (25 assets).
 */

/** Estimate file size for UI display */
export function estimateFileSize(assets: MediaAsset[], format: 'pdf' | 'xlsx' | 'csv' | 'json' | 'zip'): string {
  const count = assets.length;
  switch (format) {
    case 'json':
      return formatBytes(count * 2500); // ~2.5KB per asset
    case 'csv':
      return formatBytes(count * 1200); // ~1.2KB per asset
    case 'xlsx':
      return formatBytes(count * 1800 + 50000); // ~1.8KB per asset + header overhead
    case 'pdf':
      return formatBytes(count * 80000 + 100000); // ~80KB per page
    case 'zip':
      return formatBytes(Math.min(count, ZIP_IMAGE_CAP) * 150000 + 50000); // ~150KB per image
    default:
      return '—';
  }
}

/** Export assets as JSON (client-side) */
export function exportJson(assets: MediaAsset[], prefix: string = 'export'): void {
  const json = JSON.stringify(assets, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildFilename(prefix, 'json');
  a.click();
  URL.revokeObjectURL(url);
}

/** Export assets as CSV (client-side, RFC 4180 with UTF-8 BOM) */
export function exportCsv(assets: MediaAsset[], prefix: string = 'export'): void {
  
  const XLSX = require('xlsx');
  const flatData = assets.map(flattenAsset);
  const ws = XLSX.utils.json_to_sheet(flatData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildFilename(prefix, 'csv');
  a.click();
  URL.revokeObjectURL(url);
}

/** Export assets as XLSX (client-side, source-colored tabs) */
export function exportXlsx(assets: MediaAsset[], prefix: string = 'export'): void {
  
  const XLSX = require('xlsx');
  const flatData = assets.map(flattenAsset);
  const ws = XLSX.utils.json_to_sheet(flatData);

  // Auto-width
  const colWidths = Object.keys(flatData[0] ?? { a: '' }).map((key) => ({
    wch: Math.max(
      key.length,
      ...flatData.map((row) => String(row[key as keyof typeof row] ?? '').length)
    ) + 2,
  }));
  ws['!cols'] = colWidths;

  // Freeze header
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Assets');
  XLSX.writeFile(wb, buildFilename(prefix, 'xlsx'));
}

/** Export a single asset as PDF (client-side) */
export async function exportPdf(asset: MediaAsset): Promise<void> {
  
  const { jsPDF } = await import('jspdf');
  
  await import('jspdf-autotable');
  
  const QRCode = await import('qrcode');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(asset.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, 50);

  // Source + date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`${asset.source.toUpperCase()} · ${asset.date}`, margin, 50 + titleLines.length * 24 + 10);

  // Preview image (if available)
  let y = 50 + titleLines.length * 24 + 30;
  if (asset.previewUrl || asset.fullUrl) {
    try {
      const imgUrl = asset.previewUrl || asset.fullUrl;
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const imgWidth = pageWidth - margin * 2;
      doc.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgWidth * 0.5);
      y += imgWidth * 0.5 + 20;
    } catch {
      // Skip image if fetch fails
    }
  }

  // Metadata table
  
  const autoTable = (doc as any).autoTable;
  autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['ID', asset.id],
      ['Native ID', asset.nativeId],
      ['Source', asset.source],
      ['Kind', asset.kind],
      ['Date', asset.date],
      ['Credit', asset.credit ?? '—'],
      ['Center', asset.center ?? '—'],
      ...Object.entries(asset.metadata).map(([k, v]) => [k, String(v)]),
    ],
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237] },
    margin: { left: margin, right: margin },
  });

  y = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 200;
  y += 20;

  // Description
  if (asset.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, y);
    y += 16;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(asset.description, pageWidth - margin * 2);
    doc.text(descLines, margin, y);
    y += descLines.length * 14 + 20;
  }

  // Citations
  if (asset.citations.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Citations', margin, y);
    y += 16;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const citation of asset.citations) {
      const lines = doc.splitTextToSize(`${citation.label}: ${citation.url}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 14;
    }
    y += 20;
  }

  // QR code to NASA source
  if (asset.citations[0]?.url) {
    try {
      const qrDataUrl = await QRCode.toDataURL(asset.citations[0].url, { width: 100 });
      doc.addImage(qrDataUrl, 'PNG', margin, y, 80, 80);
      doc.setFontSize(8);
      doc.text('Scan to view source', margin, y + 95);
    } catch {
      // Skip QR on error
    }
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generated by Cosmos Vault · ${new Date().toISOString()}`,
    margin,
    footerY
  );

  doc.save(buildFilename(`${asset.source}-${slugify(asset.title).slice(0, 30)}`, 'pdf'));
}

/** Export assets as ZIP (client-side, images + manifest) */
export async function exportZip(assets: MediaAsset[], prefix: string = 'export'): Promise<void> {
  
  const JSZip = (await import('jszip')).default;
  
  const { saveAs } = await import('file-saver');

  const zip = new JSZip();
  const capped = assets.slice(0, ZIP_IMAGE_CAP);

  // Download images
  const imageFolder = zip.folder('images');
  for (let i = 0; i < capped.length; i++) {
    const asset = capped[i]!;
    if (!asset.downloadUrl && !asset.fullUrl) continue;
    try {
      const response = await fetch(asset.downloadUrl ?? asset.fullUrl);
      const blob = await response.blob();
      const ext = asset.kind === 'video' ? 'mp4' : 'jpg';
      imageFolder?.file(`${String(i + 1).padStart(3, '0')}_${slugify(asset.title).slice(0, 40)}.${ext}`, blob);
    } catch {
      // Skip failed downloads
    }
  }

  // Manifest
  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        source: 'Cosmos Vault',
        count: capped.length,
        assets: capped.map((a) => ({ id: a.id, title: a.title, source: a.source, date: a.date })),
      },
      null,
      2
    )
  );

  // Citations
  const citations = capped
    .flatMap((a) => a.citations.map((c) => `${a.title}: ${c.label} — ${c.url}`))
    .join('\n');
  zip.file('citations.txt', citations);

  // README
  zip.file(
    'README.txt',
    `Cosmos Vault Export\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Assets: ${capped.length}\n\n` +
      `This ZIP contains images and metadata exported from NASA APIs via Cosmos Vault.\n` +
      `All imagery is credited to NASA and its respective missions.\n`
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, buildFilename(prefix, 'zip'));
}

/** Flatten a MediaAsset for CSV/XLSX export */
export function flattenAsset(asset: MediaAsset): Record<string, string | number | boolean> {
  const flat: Record<string, string | number | boolean> = {
    id: asset.id,
    nativeId: asset.nativeId,
    source: asset.source,
    kind: asset.kind,
    title: asset.title,
    description: asset.description ?? '',
    date: asset.date,
    credit: asset.credit ?? '',
    center: asset.center ?? '',
    thumbUrl: asset.thumbUrl,
    previewUrl: asset.previewUrl,
    fullUrl: asset.fullUrl,
    keywords: asset.keywords.join('; '),
  };
  for (const [key, value] of Object.entries(asset.metadata)) {
    flat[`meta_${key}`] = value ?? '';
  }
  return flat;
}

/** Get the source color for XLSX tab coloring */
export function getSourceColor(source: string): string {
  return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] ?? '#7C3AED';
}
