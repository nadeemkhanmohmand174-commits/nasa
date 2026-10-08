'use client';
import { create } from 'zustand';
import type { MediaSource, MediaKind } from '@/types';

interface FilterState {
  query: string;
  sources: Set<MediaSource>;
  kinds: Set<MediaKind>;
  yearStart: number | null;
  yearEnd: number | null;
  rover: string | null;
  camera: string | null;
  hazardousOnly: boolean;
  sort: 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
  view: 'grid' | 'masonry' | 'list';
  setQuery: (q: string) => void;
  toggleSource: (s: MediaSource) => void;
  toggleKind: (k: MediaKind) => void;
  setYearRange: (start: number | null, end: number | null) => void;
  setRover: (r: string | null) => void;
  setCamera: (c: string | null) => void;
  setHazardousOnly: (h: boolean) => void;
  setSort: (s: FilterState['sort']) => void;
  setView: (v: FilterState['view']) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  sources: new Set(),
  kinds: new Set(),
  yearStart: null,
  yearEnd: null,
  rover: null,
  camera: null,
  hazardousOnly: false,
  sort: 'date-desc',
  view: 'grid',
  setQuery: (query) => set({ query }),
  toggleSource: (s) => set((state) => { const ns = new Set(state.sources); ns.has(s) ? ns.delete(s) : ns.add(s); return { sources: ns }; }),
  toggleKind: (k) => set((state) => { const ns = new Set(state.kinds); ns.has(k) ? ns.delete(k) : ns.add(k); return { kinds: ns }; }),
  setYearRange: (yearStart, yearEnd) => set({ yearStart, yearEnd }),
  setRover: (rover) => set({ rover }),
  setCamera: (camera) => set({ camera }),
  setHazardousOnly: (hazardousOnly) => set({ hazardousOnly }),
  setSort: (sort) => set({ sort }),
  setView: (view) => set({ view }),
  clearAll: () => set({ query: '', sources: new Set(), kinds: new Set(), yearStart: null, yearEnd: null, rover: null, camera: null, hazardousOnly: false }),
}));
