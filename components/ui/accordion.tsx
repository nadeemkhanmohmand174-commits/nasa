'use client';
import * as React from 'react';
import * as A from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = A.Root;
const AccordionItem = React.forwardRef<React.ElementRef<typeof A.Item>, React.ComponentPropsWithoutRef<typeof A.Item>>(({ className, ...props }, ref) => <A.Item ref={ref} className={cn('border-b border-border', className)} {...props} />);
AccordionItem.displayName = 'AccordionItem';
const AccordionTrigger = React.forwardRef<React.ElementRef<typeof A.Trigger>, React.ComponentPropsWithoutRef<typeof A.Trigger>>(({ className, children, ...props }, ref) => (
  <A.Header className="flex"><A.Trigger ref={ref} className={cn('flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180', className)} {...props}>{children}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" /></A.Trigger></A.Header>
));
AccordionTrigger.displayName = A.Trigger.displayName;
const AccordionContent = React.forwardRef<React.ElementRef<typeof A.Content>, React.ComponentPropsWithoutRef<typeof A.Content>>(({ className, children, ...props }, ref) => (
  <A.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}><div className={cn('pb-4 pt-0', className)}>{children}</div></A.Content>
));
AccordionContent.displayName = A.Content.displayName;
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
