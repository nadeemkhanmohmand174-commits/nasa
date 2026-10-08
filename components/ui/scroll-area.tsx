'use client';
import * as React from 'react';
import * as SA from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';
const ScrollArea = React.forwardRef<React.ElementRef<typeof SA.Root>, React.ComponentPropsWithoutRef<typeof SA.Root>>(({ className, children, ...props }, ref) => (
  <SA.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}><SA.Viewport className="h-full w-full rounded-[inherit]">{children}</SA.Viewport><SA.Scrollbar orientation="vertical" className="flex w-2.5 touch-none p-[1px]"><SA.Thumb className="relative flex-1 rounded-full bg-border" /></SA.Scrollbar><SA.Corner /></SA.Root>
));
ScrollArea.displayName = SA.Root.displayName;
export { ScrollArea };
