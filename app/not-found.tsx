import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Rocket className="h-12 w-12 text-nebula-violet" />
      <div>
        <h1 className="font-heading text-6xl font-bold gradient-heading">404</h1>
        <p className="mt-2 text-muted-foreground">Lost in space — this page doesn't exist.</p>
      </div>
      <Button variant="gradient" asChild><Link href="/">Back to Earth</Link></Button>
    </div>
  );
}
