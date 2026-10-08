'use client';
import * as React from 'react';
import * as Sw from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<React.ElementRef<typeof Sw.Root>, React.ComponentPropsWithoutRef<typeof Sw.Root>>(({ className, ...props }, ref) => (
  <Sw.Root ref={ref} className={cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', className)} {...props}>
    <Sw.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </Sw.Root>
));
Switch.displayName = Sw.Root.displayName;
export { Switch };
