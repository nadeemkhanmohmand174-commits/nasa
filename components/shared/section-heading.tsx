import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered, className }: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', centered && 'text-center', className)}>
      <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p>}
    </div>
  );
}
