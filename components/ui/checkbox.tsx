'use client';
import * as React from 'react';
import * as C from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<React.ElementRef<typeof C.Root>, React.ComponentPropsWithoutRef<typeof C.Root>>(({ className, ...props }, ref) => (
  <C.Root ref={ref} className={cn('peer h-4 w-4 shrink-0 rounded-sm border border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', className)} {...props}>
    <C.Indicator className="flex items-center justify-center text-current"><Check className="h-3.5 w-3.5" /></C.Indicator>
  </C.Root>
));
Checkbox.displayName = C.Root.displayName;
export { Checkbox };
