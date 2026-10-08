'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const DropdownMenu = D.Root;
const DropdownMenuTrigger = D.Trigger;
const DropdownMenuGroup = D.Group;

const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(({ className, sideOffset = 4, ...props }, ref) => (
  <D.Portal><D.Content ref={ref} sideOffset={sideOffset} className={cn('z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out', className)} {...props} /></D.Portal>
));
DropdownMenuContent.displayName = D.Content.displayName;

const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof D.Item>, React.ComponentPropsWithoutRef<typeof D.Item> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <D.Item ref={ref} className={cn('relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', inset && 'pl-8', className)} {...props} />
));
DropdownMenuItem.displayName = D.Item.displayName;

const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof D.Label>, React.ComponentPropsWithoutRef<typeof D.Label>>(({ className, ...props }, ref) => (
  <D.Label ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
));
DropdownMenuLabel.displayName = D.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof D.Separator>, React.ComponentPropsWithoutRef<typeof D.Separator>>(({ className, ...props }, ref) => (
  <D.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
));
DropdownMenuSeparator.displayName = D.Separator.displayName;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup };
