'use client';
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
