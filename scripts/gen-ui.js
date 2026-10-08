const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function w(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log('✓', filePath);
}

// ─── Toast ───────────────────────────────────────────
w('components/ui/toast.tsx', `'use client';
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport ref={ref} className={cn('fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:max-w-[420px]', className)} {...props} />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg transition-all',
  { variants: { variant: { default: 'border-border bg-card text-card-foreground', destructive: 'border-destructive bg-destructive text-destructive-foreground', success: 'border-green-500/30 bg-green-500/10 text-foreground' } }, defaultVariants: { variant: 'default' } }
);

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close ref={ref} className={cn('absolute right-1 top-1 rounded-md p-1 opacity-60 hover:opacity-100', className)} toast-close="" {...props}><X className="h-4 w-4" /></ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription };
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
`);

w('hooks/use-toast.ts', `'use client';
import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';

type ToasterToast = ToastProps & { id: string; title?: React.ReactNode; description?: React.ReactNode };
const TOAST_LIMIT = 5;
let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }
const listeners: Array<(state: { toasts: ToasterToast[] }) => void> = [];
let memoryState: { toasts: ToasterToast[] } = { toasts: [] };

function dispatch(action: { type: 'ADD'; toast: ToasterToast } | { type: 'REMOVE'; id: string }) {
  if (action.type === 'ADD') {
    memoryState = { toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
  } else {
    memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.id) };
  }
  listeners.forEach((l) => l(memoryState));
}

export function toast({ title, description, variant, ...props }: Omit<ToasterToast, 'id'>) {
  const id = genId();
  const dismiss = () => dispatch({ type: 'REMOVE', id });
  dispatch({ type: 'ADD', toast: { ...props, id, title, description, variant, onOpenChange: dismiss } });
  setTimeout(() => dismiss(), 5000);
  return { id, dismiss };
}

export function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { ...state, toast };
}
`);

w('components/ui/toaster.tsx', `'use client';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">{title && <ToastTitle>{title}</ToastTitle>}{description && <ToastDescription>{description}</ToastDescription>}</div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
`);

// ─── Dropdown ────────────────────────────────────────
w('components/ui/dropdown-menu.tsx', `'use client';
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
`);

// ─── Tabs ────────────────────────────────────────────
w('components/ui/tabs.tsx', `'use client';
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
`);

// ─── Select ──────────────────────────────────────────
w('components/ui/select.tsx', `'use client';
import * as React from 'react';
import * as S from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = S.Root;
const SelectGroup = S.Group;
const SelectValue = S.Value;

const SelectTrigger = React.forwardRef<React.ElementRef<typeof S.Trigger>, React.ComponentPropsWithoutRef<typeof S.Trigger>>(({ className, children, ...props }, ref) => (
  <S.Trigger ref={ref} className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50', className)} {...props}>{children}<S.Icon asChild><ChevronDown className="h-4 w-4 opacity-50" /></S.Icon></S.Trigger>
));
SelectTrigger.displayName = S.Trigger.displayName;

const SelectContent = React.forwardRef<React.ElementRef<typeof S.Content>, React.ComponentPropsWithoutRef<typeof S.Content>>(({ className, children, position = 'popper', ...props }, ref) => (
  <S.Portal><S.Content ref={ref} className={cn('relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md', className)} position={position} {...props}><S.Viewport className="p-1">{children}</S.Viewport></S.Content></S.Portal>
));
SelectContent.displayName = S.Content.displayName;

const SelectItem = React.forwardRef<React.ElementRef<typeof S.Item>, React.ComponentPropsWithoutRef<typeof S.Item>>(({ className, children, ...props }, ref) => (
  <S.Item ref={ref} className={cn('relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent', className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><S.ItemIndicator><Check className="h-4 w-4" /></S.ItemIndicator></span>
    <S.ItemText>{children}</S.ItemText>
  </S.Item>
));
SelectItem.displayName = S.Item.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
`);

// ─── Switch ──────────────────────────────────────────
w('components/ui/switch.tsx', `'use client';
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
`);

// ─── Dialog ──────────────────────────────────────────
w('components/ui/dialog.tsx', `'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = D.Root;
const DialogTrigger = D.Trigger;
const DialogClose = D.Close;

const DialogContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(({ className, children, ...props }, ref) => (
  <D.Portal>
    <D.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <D.Content ref={ref} className={cn('fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-card p-6 shadow-lg sm:rounded-lg', className)} {...props}>
      {children}
      <D.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"><X className="h-4 w-4" /><span className="sr-only">Close</span></D.Close>
    </D.Content>
  </D.Portal>
));
DialogContent.displayName = D.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />;
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
const DialogTitle = React.forwardRef<React.ElementRef<typeof D.Title>, React.ComponentPropsWithoutRef<typeof D.Title>>(({ className, ...props }, ref) => <D.Title ref={ref} className={cn('text-lg font-semibold tracking-tight', className)} {...props} />);
DialogTitle.displayName = D.Title.displayName;
const DialogDescription = React.forwardRef<React.ElementRef<typeof D.Description>, React.ComponentPropsWithoutRef<typeof D.Description>>(({ className, ...props }, ref) => <D.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />);
DialogDescription.displayName = D.Description.displayName;

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
`);

// ─── Accordion ───────────────────────────────────────
w('components/ui/accordion.tsx', `'use client';
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
`);

// ─── Checkbox ────────────────────────────────────────
w('components/ui/checkbox.tsx', `'use client';
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
`);

// ─── Label ───────────────────────────────────────────
w('components/ui/label.tsx', `'use client';
import * as React from 'react';
import * as L from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
const Label = React.forwardRef<React.ElementRef<typeof L.Root>, React.ComponentPropsWithoutRef<typeof L.Root>>(({ className, ...props }, ref) => <L.Root ref={ref} className={cn('text-sm font-medium leading-none', className)} {...props} />);
Label.displayName = L.Root.displayName;
export { Label };
`);

// ─── Separator ───────────────────────────────────────
w('components/ui/separator.tsx', `'use client';
import * as React from 'react';
import * as S from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
const Separator = React.forwardRef<React.ElementRef<typeof S.Root>, React.ComponentPropsWithoutRef<typeof S.Root>>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <S.Root ref={ref} decorative={decorative} orientation={orientation} className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)} {...props} />
));
Separator.displayName = S.Root.displayName;
export { Separator };
`);

// ─── ScrollArea ──────────────────────────────────────
w('components/ui/scroll-area.tsx', `'use client';
import * as React from 'react';
import * as SA from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';
const ScrollArea = React.forwardRef<React.ElementRef<typeof SA.Root>, React.ComponentPropsWithoutRef<typeof SA.Root>>(({ className, children, ...props }, ref) => (
  <SA.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}><SA.Viewport className="h-full w-full rounded-[inherit]">{children}</SA.Viewport><SA.Scrollbar orientation="vertical" className="flex w-2.5 touch-none p-[1px]"><SA.Thumb className="relative flex-1 rounded-full bg-border" /></SA.Scrollbar><SA.Corner /></SA.Root>
));
ScrollArea.displayName = SA.Root.displayName;
export { ScrollArea };
`);

// ─── Tooltip ─────────────────────────────────────────
w('components/ui/tooltip.tsx', `'use client';
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
`);

// ─── Progress ────────────────────────────────────────
w('components/ui/progress.tsx', `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(({ className, value = 0, ...props }, ref) => (
  <div ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)} {...props}>
    <div className="h-full rounded-full bg-primary transition-all" style={{ width: \`\${Math.min(100, Math.max(0, value))}%\` }} />
  </div>
));
Progress.displayName = 'Progress';
export { Progress };
`);

console.log('\n✅ UI components batch 1 complete');
