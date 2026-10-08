'use client';
import * as React from 'react';
import * as T from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
const TooltipProvider = T.Provider;
const Tooltip = T.Root;
const TooltipTrigger = T.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof T.Content>, React.ComponentPropsWithoutRef<typeof T.Content>>(({ className, sideOffset = 4, ...props }, ref) => (
  <T.Portal><T.Content ref={ref} sideOffset={sideOffset} className={cn('z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md', className)} {...props} /></T.Portal>
));
TooltipContent.displayName = T.Content.displayName;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
