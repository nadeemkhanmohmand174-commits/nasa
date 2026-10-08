'use client';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="font-heading text-2xl font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <Button variant="gradient" onClick={reset}><RotateCcw className="h-4 w-4" /> Try Again</Button>
    </div>
  );
}
