'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutGrid, Rows3, Columns3, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { DownloadMenu } from '@/components/export/download-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { FilterChip } from '@/components/shared/filter-chip';
import { useDebounce } from '@/hooks/use-debounce';
import { useFilterStore } from '@/stores/filters';
import { SOURCE_LABELS, KIND_LABELS } from '@/lib/constants';
import type { MediaSource, MediaKind } from '@/types';
import { cn } from '@/lib/utils';

const SOURCES: MediaSource[] = ['apod', 'mars', 'neo', 'epic', 'library', 'earth', 'techtransfer'];
const KINDS: MediaKind[] = ['image', 'video', 'audio', 'dataset', 'document'];

export default function ExplorePage() {
  const filters = useFilterStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedQuery = useDebounce(filters.query, 400);

  // Primary search via NASA Library
  const { data, isLoading, error } = useQuery({
    queryKey: ['explore', debouncedQuery, filters.sources],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      params.set('media_type', 'image');
      const res = await fetch(`/api/nasa/library/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const json = await res.json();
      return json.data as any[];
    },
    enabled: debouncedQuery.length > 0,
  });

  const assets = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (filters.sources.size > 0) result = result.filter((a) => filters.sources.has(a.source));
    if (filters.kinds.size > 0) result = result.filter((a) => filters.kinds.has(a.kind));
    if (filters.yearStart) result = result.filter((a) => parseInt(a.date?.slice(0, 4) ?? '0') >= filters.yearStart!);
    if (filters.yearEnd) result = result.filter((a) => parseInt(a.date?.slice(0, 4) ?? '0') <= filters.yearEnd!);
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'date-asc': return (a.date ?? '').localeCompare(b.date ?? '');
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        default: return (b.date ?? '').localeCompare(a.date ?? '');
      }
    });
    return result;
  }, [data, filters.sources, filters.kinds, filters.yearStart, filters.yearEnd, filters.sort]);

  const selectedAssets = assets.filter((a) => selected.has(a.id));
  const activeChips = [
    ...Array.from(filters.sources).map((s) => ({ label: SOURCE_LABELS[s], onRemove: () => filters.toggleSource(s) })),
    ...Array.from(filters.kinds).map((k) => ({ label: KIND_LABELS[k], onRemove: () => filters.toggleKind(k) })),
    ...(filters.yearStart ? [{ label: `From ${filters.yearStart}`, onRemove: () => filters.setYearRange(null, filters.yearEnd) }] : []),
    ...(filters.yearEnd ? [{ label: `To ${filters.yearEnd}`, onRemove: () => filters.setYearRange(filters.yearStart, null) }] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Explore NASA Media</h1>
        <p className="mt-1 text-muted-foreground">Search across the NASA image library with advanced filters.</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search for galaxies, planets, missions..." value={filters.query} onChange={(e) => filters.setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.sort} onValueChange={(v) => filters.setSort(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-border">
            <Button variant={filters.view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('grid')} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={filters.view === 'masonry' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('masonry')} aria-label="Masonry view"><Columns3 className="h-4 w-4" /></Button>
            <Button variant={filters.view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => filters.setView('list')} aria-label="List view"><Rows3 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </summary>
          <div className="absolute z-50 mt-2 w-64 rounded-md border border-border bg-popover p-4 shadow-lg">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs uppercase text-muted-foreground">Source</Label>
                <div className="space-y-2">
                  {SOURCES.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox checked={filters.sources.has(s)} onCheckedChange={() => filters.toggleSource(s)} id={`src-${s}`} />
                      <Label htmlFor={`src-${s}`} className="text-sm">{SOURCE_LABELS[s]}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-xs uppercase text-muted-foreground">Type</Label>
                <div className="space-y-2">
                  {KINDS.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <Checkbox checked={filters.kinds.has(k)} onCheckedChange={() => filters.toggleKind(k)} id={`kind-${k}`} />
                      <Label htmlFor={`kind-${k}`} className="text-sm">{KIND_LABELS[k]}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>
        {activeChips.map((chip, i) => <FilterChip key={i} {...chip} />)}
        {activeChips.length > 0 && <Button variant="ghost" size="sm" onClick={() => filters.clearAll()}><X className="h-3 w-3" /> Clear all</Button>}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-30 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 backdrop-blur">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <DownloadMenu assets={selectedAssets} prefix="bulk-export" variant="compact" />
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <MediaSkeleton />
      ) : error ? (
        <EmptyState title="Search failed" description="Please try again" />
      ) : assets.length === 0 && debouncedQuery ? (
        <EmptyState title="No results" description="Try a different search term" />
      ) : assets.length === 0 ? (
        <EmptyState title="Start searching" description="Enter a query above to explore the NASA media archive" action={<Button variant="gradient" onClick={() => filters.setQuery('galaxy')}>Try searching for galaxies</Button>} />
      ) : (
        <MediaGrid assets={assets} variant={filters.view} onFavorite={(a) => { const ns = new Set(selected); ns.has(a.id) ? ns.delete(a.id) : ns.add(a.id); setSelected(ns); }} favorites={selected} />
      )}
    </div>
  );
}
