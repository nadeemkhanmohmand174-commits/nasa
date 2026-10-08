'use client';
import * as React from 'react';
import * as T from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = T.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof T.List>, React.ComponentPropsWithoutRef<typeof T.List>>(({ className, ...props }, ref) => (
  <T.List ref={ref} className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)} {...props} />
));
TabsList.displayName = T.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof T.Trigger>, React.ComponentPropsWithoutRef<typeof T.Trigger>>(({ className, ...props }, ref) => (
  <T.Trigger ref={ref} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)} {...props} />
));
TabsTrigger.displayName = T.Trigger.displayName;

const TabsContent = React.forwardRef<React.ElementRef<typeof T.Content>, React.ComponentPropsWithoutRef<typeof T.Content>>(({ className, ...props }, ref) => (
  <T.Content ref={ref} className={cn('mt-2 focus-visible:outline-none', className)} {...props} />
));
TabsContent.displayName = T.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
