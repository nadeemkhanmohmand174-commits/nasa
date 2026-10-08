'use client';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

export function FilterChip({ label, onRemove, color }: FilterChipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs', 'border-border bg-accent')} style={color ? { borderColor: color, color } : undefined}>
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-foreground/10" aria-label={`Remove ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
