'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { MediaAsset } from '@/types';

interface LightboxProps {
  asset: MediaAsset | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({ asset, onClose, onPrev, onNext }: LightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 1));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl border-border/40 bg-black/95 p-0">
        <div className="relative flex h-[80vh] items-center justify-center overflow-hidden">
          {asset.fullUrl ? (
            <img src={asset.fullUrl} alt={asset.title}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-200" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No preview available</div>
          )}

          {onPrev && (
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={onPrev} aria-label="Previous"><ChevronLeft className="h-6 w-6" /></Button>
          )}
          {onNext && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={onNext} aria-label="Next"><ChevronRight className="h-6 w-6" /></Button>
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <Button variant="ghost" size="icon" className="bg-black/50" onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="bg-black/50" onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="border-t border-border/40 p-4">
          <h3 className="font-heading text-lg font-semibold">{asset.title}</h3>
          {asset.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{asset.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
