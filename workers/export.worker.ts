/**
 * Export Web Worker — runs export operations off the main thread
 * so the UI never freezes during large exports.
 */
import type { MediaAsset } from '@/types';

self.onmessage = async (e: MessageEvent<{ assets: MediaAsset[]; format: string; prefix: string }>) => {
  const { assets, format, prefix } = e.data;

  try {
    self.postMessage({ type: 'progress', value: 0, total: assets.length });

    if (format === 'json') {
      const json = JSON.stringify(assets, null, 2);
      self.postMessage({ type: 'complete', blob: new Blob([json], { type: 'application/json' }), filename: `${prefix}.json` });
    } else if (format === 'csv') {
      // Dynamic import inside worker
      const XLSX = await import('xlsx');
      const flatData = assets.map((a) => ({
        id: a.id, source: a.source, kind: a.kind, title: a.title, date: a.date, credit: a.credit ?? '',
      }));
      const ws = XLSX.utils.json_to_sheet(flatData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      self.postMessage({ type: 'complete', blob: new Blob(['\uFEFF' + csv], { type: 'text/csv' }), filename: `${prefix}.csv` });
    } else {
      self.postMessage({ type: 'error', error: `Unsupported format: ${format}` });
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: (err as Error).message });
  }
};

export {};
