'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Telescope } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    // The actual code exchange happens in the API route
    setTimeout(() => router.push('/dashboard'), 1500);
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Telescope className="mx-auto h-12 w-12 animate-pulse text-nebula-violet" />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
