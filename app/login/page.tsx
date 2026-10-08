'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Telescope, Mail, Lock, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/env';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!configured) { toast({ title: 'Supabase not configured', description: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local', variant: 'destructive' }); return; }
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      if (!supabase) throw new Error('Not configured');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Welcome back!', variant: 'success' });
      router.push(params.get('next') ?? '/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: (err as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <Telescope className="mx-auto h-10 w-10 text-nebula-violet" />
          <CardTitle className="mt-2">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label className="mb-1.5 block">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div></div>
            <div><Label className="mb-1.5 block">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required /></div></div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
          <Button variant="outline" className="w-full" disabled={!configured}><Github className="h-4 w-4" /> Continue with GitHub</Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">No account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></p>
          {!configured && <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-center text-xs text-amber-400">Supabase not configured — browse-only mode</p>}
        </CardContent>
      </Card>
    </div>
  );
}
