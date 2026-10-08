import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { MediaSource } from '@/types';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Source-specific badge with proper colors */
function SourceBadge({ source, className }: { source: MediaSource; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(`badge-${source} border`, className)}
    >
      {source.toUpperCase()}
    </Badge>
  );
}

export { Badge, SourceBadge, badgeVariants };
