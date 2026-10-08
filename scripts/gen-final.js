const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function w(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log('✓', filePath);
}

// ═══════════════════════════════════════════════════════════════
// AUTH PAGES
// ═══════════════════════════════════════════════════════════════
w('app/login/page.tsx', `'use client';
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
`);

w('app/signup/page.tsx', `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Telescope, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/env';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!configured) { toast({ title: 'Supabase not configured', variant: 'destructive' }); return; }
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      if (!supabase) throw new Error('Not configured');
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
      if (error) throw error;
      toast({ title: 'Account created!', description: 'Check your email to verify.' });
      router.push('/login');
    } catch (err) {
      toast({ title: 'Signup failed', description: (err as Error).message, variant: 'destructive' });
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <Telescope className="mx-auto h-10 w-10 text-nebula-violet" />
          <CardTitle className="mt-2">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label className="mb-1.5 block">Username</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required /></div></div>
            <div><Label className="mb-1.5 block">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required /></div></div>
            <div><Label className="mb-1.5 block">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} /></div></div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></p>
          {!configured && <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-center text-xs text-amber-400">Supabase not configured — browse-only mode</p>}
        </CardContent>
      </Card>
    </div>
  );
}
`);

w('app/auth/callback/page.tsx', `'use client';
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
`);

// ═══════════════════════════════════════════════════════════════
// PUBLIC COLLECTION PAGE
// ═══════════════════════════════════════════════════════════════
w('app/c/[slug]/page.tsx', `'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { DownloadMenu } from '@/components/export/download-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Lock } from 'lucide-react';

const demoCollections: Record<string, { name: string; description: string; assets: any[] }> = {
  'best-of-apod': { name: 'Best of APOD', description: 'Curated astronomy pictures', assets: [] },
  'mars-highlights': { name: 'Mars Highlights', description: 'Top rover photos', assets: [] },
  'hazardous-neos': { name: 'Hazardous NEOs', description: 'Potentially hazardous asteroids', assets: [] },
};

export default function PublicCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const collection = demoCollections[slug];

  const { data: apodAssets, isLoading } = useQuery({
    queryKey: ['collection-apod', slug],
    queryFn: async () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const res = await fetch(\`/api/nasa/apod/range?start_date=\${fmt(start)}&end_date=\${fmt(end)}\`);
      if (!res.ok) throw new Error('Failed');
      return (await res.json()).data;
    },
  });

  const assets = apodAssets ?? [];

  if (!collection) {
    return <EmptyState title="Collection not found" description="This collection may be private or deleted." action={<Button asChild><Link href="/collections">Browse Collections</Link></Button>} />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild><Link href="/collections"><ArrowLeft className="h-4 w-4" /> Back to Collections</Link></Button>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-nebula-violet" />
            <h1 className="font-heading text-3xl font-bold">{collection.name}</h1>
          </div>
          <p className="mt-1 text-muted-foreground">{collection.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">{assets.length} items</p>
        </div>
        {assets.length > 0 && <DownloadMenu assets={assets} prefix={\`collection-\${slug}\`} />}
      </div>
      {isLoading ? <MediaSkeleton /> : assets.length === 0 ? <EmptyState title="No items" description="This collection is empty" /> : <MediaGrid assets={assets} />}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// ERROR / NOT-FOUND / LOADING
// ═══════════════════════════════════════════════════════════════
w('app/error.tsx', `'use client';
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
`);

w('app/not-found.tsx', `import Link from 'next/link';
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
`);

w('app/loading.tsx', `export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// SITEMAP / ROBOTS / MANIFEST / OG IMAGE
// ═══════════════════════════════════════════════════════════════
w('app/sitemap.ts', `import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const env = getEnv();
  const base = env.NEXT_PUBLIC_SITE_URL;
  const routes = ['', '/explore', '/apod', '/mars', '/neo', '/earth', '/collections', '/downloads', '/dashboard', '/about', '/login', '/signup'];
  return routes.map((route) => ({ url: \`\${base}\${route}\`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: route === '' ? 1 : 0.8 }));
}
`);

w('app/robots.ts', `import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const env = getEnv();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/'] },
    sitemap: \`\${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml\`,
  };
}
`);

w('app/manifest.ts', `import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cosmos Vault',
    short_name: 'CosmosVault',
    description: 'NASA research media and data exploration platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#05060F',
    theme_color: '#05060F',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
`);

w('app/opengraph-image.tsx', `import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div style={{ background: 'linear-gradient(135deg, #05060F 0%, #0B0F1F 100%)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ fontSize: 72, fontWeight: 700, background: 'linear-gradient(135deg, #7C3AED, #22D3EE)', backgroundClip: 'text', color: 'transparent' }}>COSMOS VAULT</div>
      <div style={{ fontSize: 28, color: '#94A3B8', marginTop: 16 }}>NASA Research Media & Data Exploration</div>
    </div>,
    size
  );
}
`);

// ═══════════════════════════════════════════════════════════════
// SUPABASE MIGRATIONS
// ═══════════════════════════════════════════════════════════════
w('supabase/migrations/0001_init.sql', `-- Cosmos Vault — Initial Schema
-- Creates all tables for profiles, collections, favorites, downloads, search history, notes, and asset cache

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Collections
create table if not exists public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  slug text not null unique,
  is_public boolean not null default false,
  cover_asset_id text,
  item_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Collection items
create table if not exists public.collection_items (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  asset_id text not null,
  asset_snapshot jsonb not null default '{}',
  position integer not null default 0,
  added_at timestamptz not null default now(),
  unique(collection_id, asset_id)
);

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id text not null,
  asset_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id, asset_id)
);

-- Downloads
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  asset_id text not null,
  format text not null check (format in ('image','pdf','xlsx','csv','json','zip')),
  item_count integer not null default 1,
  byte_size bigint not null default 0,
  created_at timestamptz not null default now()
);

-- Search history
create table if not exists public.search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  query text not null,
  filters jsonb not null default '{}',
  source text not null,
  result_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Notes
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Asset cache
create table if not exists public.asset_cache (
  asset_id text primary key,
  source text not null,
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  raw jsonb not null default '{}',
  cached_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_collections_user on public.collections(user_id);
create index if not exists idx_collections_public on public.collections(is_public) where is_public = true;
create index if not exists idx_collection_items_collection on public.collection_items(collection_id);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_downloads_user on public.downloads(user_id);
create index if not exists idx_downloads_created on public.downloads(created_at desc);
create index if not exists idx_search_history_user on public.search_history(user_id);
create index if not exists idx_notes_user_asset on public.notes(user_id, asset_id);
create index if not exists idx_asset_cache_source on public.asset_cache(source);
`);

w('supabase/migrations/0002_policies.sql', `-- Cosmos Vault — RLS Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.favorites enable row level security;
alter table public.downloads enable row level security;
alter table public.search_history enable row level security;
alter table public.notes enable row level security;
alter table public.asset_cache enable row level security;

-- Profiles: users can read/update their own profile
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Collections: owner has full access, public collections are readable by all
create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id);
create policy "Public collections are viewable by all" on public.collections for select using (is_public = true);
create policy "Users can create own collections" on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections" on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections" on public.collections for delete using (auth.uid() = user_id);

-- Collection items: readable if parent collection is owned or public
create policy "Items viewable by collection owner" on public.collection_items for select using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
create policy "Items viewable for public collections" on public.collection_items for select using (
  exists (select 1 from public.collections c where c.id = collection_id and c.is_public = true)
);
create policy "Items insertable by collection owner" on public.collection_items for insert with check (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
create policy "Items deletable by collection owner" on public.collection_items for delete using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
create policy "Items updatable by collection owner" on public.collection_items for update using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);

-- Favorites: owner only
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Downloads: anonymous insert allowed (no read for anon), owner can read
create policy "Users can view own downloads" on public.downloads for select using (auth.uid() = user_id);
create policy "Anyone can log downloads" on public.downloads for insert with check (true);

-- Search history: anonymous insert allowed, owner can read
create policy "Users can view own search history" on public.search_history for select using (auth.uid() = user_id);
create policy "Anyone can log searches" on public.search_history for insert with check (true);

-- Notes: owner only
create policy "Users can view own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on public.notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on public.notes for delete using (auth.uid() = user_id);

-- Asset cache: public read, no direct write (managed server-side)
create policy "Asset cache is publicly readable" on public.asset_cache for select using (true);
`);

w('supabase/migrations/0003_functions.sql', `-- Cosmos Vault — Functions and Triggers

-- handle_updated_at: updates the updated_at column
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to collections
create trigger collections_updated_at
  before update on public.collections
  for each row execute function public.handle_updated_at();

-- Apply updated_at trigger to notes
create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- handle_new_user: creates a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger: create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- update_collection_item_count: maintains denormalized item_count
create or replace function public.update_collection_item_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.collections set item_count = item_count + 1 where id = new.collection_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.collections set item_count = item_count - 1 where id = old.collection_id;
    return old;
  end if;
  return null;
end;
$$;

-- Trigger: update item count on collection_items insert/delete
create trigger collection_items_count_insert
  after insert on public.collection_items
  for each row execute function public.update_collection_item_count();

create trigger collection_items_count_delete
  after delete on public.collection_items
  for each row execute function public.update_collection_item_count();

-- search_collections_public: helper to search public collections
create or replace function public.search_collections_public(search_query text)
returns table (
  id uuid,
  name text,
  description text,
  slug text,
  item_count integer,
  created_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select id, name, description, slug, item_count, created_at
  from public.collections
  where is_public = true
    and (
      name ilike '%' || search_query || '%'
      or description ilike '%' || search_query || '%'
    )
  order by created_at desc
  limit 20;
$$;
`);

w('supabase/seed.sql', `-- Cosmos Vault — Seed Data
-- Demo collections for testing

insert into public.collections (user_id, name, description, slug, is_public, item_count)
values
  ('00000000-0000-0000-0000-000000000001', 'Best of APOD', 'Curated astronomy pictures of the day', 'best-of-apod', true, 24),
  ('00000000-0000-0000-0000-000000000001', 'Mars Highlights', 'Top photos from Curiosity and Perseverance rovers', 'mars-highlights', true, 18),
  ('00000000-0000-0000-0000-000000000001', 'Hazardous NEOs', 'Potentially hazardous asteroid tracking data', 'hazardous-neos', false, 7)
on conflict (slug) do nothing;

-- Storage buckets (run manually in Supabase dashboard or via CLI)
-- create bucket if not exists avatars;
-- create bucket if not exists user-files;
-- create bucket if not exists exports;
--
-- alter bucket avatars set public true;
-- alter bucket user-files set public false;
-- alter bucket exports set public false;
`);

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════
w('tests/setup.ts', `import '@testing-library/jest-dom';
`);

w('tests/utils.test.ts', `import { describe, it, expect } from 'vitest';
import { cn, slugify, formatDate, formatBytes, formatNumber, clamp, truncate, getInitials, buildFilename, randomHex, isValidUrl, safeJsonParse } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });
    it('handles conditional classes', () => {
      expect(cn('base', false && 'no', true && 'yes')).toBe('base yes');
    });
    it('deduplicates tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });
    it('handles special characters', () => {
      expect(slugify('Mars @ #2024!')).toBe('mars-2024');
    });
    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      expect(formatDate('2026-10-03T10:00:00Z')).toBe('2026-10-03');
    });
    it('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('—');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes', () => { expect(formatBytes(0)).toBe('0 B'); });
    it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB'); });
    it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB'); });
  });

  describe('formatNumber', () => {
    it('adds commas to large numbers', () => { expect(formatNumber(1000000)).toBe('1,000,000'); });
  });

  describe('clamp', () => {
    it('clamps below min', () => { expect(clamp(5, 10, 20)).toBe(10); });
    it('clamps above max', () => { expect(clamp(25, 10, 20)).toBe(20); });
    it('returns value when in range', () => { expect(clamp(15, 10, 20)).toBe(15); });
  });

  describe('truncate', () => {
    it('truncates long text', () => { expect(truncate('Hello World', 5)).toBe('Hell…'); });
    it('returns short text unchanged', () => { expect(truncate('Hi', 5)).toBe('Hi'); });
  });

  describe('getInitials', () => {
    it('gets initials from name', () => { expect(getInitials('John Doe')).toBe('JD'); });
    it('handles single name', () => { expect(getInitials('John')).toBe('J'); });
  });

  describe('isValidUrl', () => {
    it('validates good URL', () => { expect(isValidUrl('https://example.com')).toBe(true); });
    it('rejects bad URL', () => { expect(isValidUrl('not a url')).toBe(false); });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => { expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 }); });
    it('returns fallback for invalid JSON', () => { expect(safeJsonParse('invalid', 'fallback')).toBe('fallback'); });
  });

  describe('randomHex', () => {
    it('generates correct length', () => { expect(randomHex(6)).toHaveLength(6); });
    it('generates only hex chars', () => { expect(randomHex(10)).toMatch(/^[0-9a-f]+$/); });
  });

  describe('buildFilename', () => {
    it('builds filename with prefix and extension', () => {
      const name = buildFilename('mars', 'xlsx');
      expect(name).toMatch(/^cosmos-vault_mars_\\d{4}-\\d{2}-\\d{2}_[0-9a-f]{6}\\.xlsx$/);
    });
  });
});
`);

w('tests/normalizers.test.ts', `import { describe, it, expect } from 'vitest';
import { normalizeApod } from '@/lib/nasa/normalizers/apod';
import { normalizeMarsPhoto } from '@/lib/nasa/normalizers/mars';
import { normalizeEpic } from '@/lib/nasa/normalizers/epic';

describe('normalizers', () => {
  describe('normalizeApod', () => {
    it('normalizes an image APOD', () => {
      const result = normalizeApod({
        date: '2026-10-03',
        title: 'Test Galaxy',
        explanation: 'A beautiful galaxy.',
        url: 'https://example.com/image.jpg',
        hdurl: 'https://example.com/hd.jpg',
        media_type: 'image',
        copyright: 'NASA',
      });
      expect(result.id).toBe('apod_2026-10-03');
      expect(result.source).toBe('apod');
      expect(result.kind).toBe('image');
      expect(result.title).toBe('Test Galaxy');
      expect(result.fullUrl).toBe('https://example.com/hd.jpg');
      expect(result.citations).toHaveLength(2);
    });

    it('normalizes a video APOD', () => {
      const result = normalizeApod({
        date: '2026-10-02',
        title: 'Test Video',
        explanation: 'A video.',
        url: 'https://youtube.com/watch?v=123',
        thumbnail_url: 'https://img.youtube.com/123.jpg',
        media_type: 'video',
      });
      expect(result.kind).toBe('video');
      expect(result.thumbUrl).toBe('https://img.youtube.com/123.jpg');
    });
  });

  describe('normalizeMarsPhoto', () => {
    it('normalizes a Mars photo', () => {
      const result = normalizeMarsPhoto({
        id: 12345,
        sol: 1000,
        camera: { id: 1, name: 'MAST', rover_id: 5, full_name: 'Mast Camera' },
        img_src: 'https://mars.nasa.gov/photo.jpg',
        earth_date: '2026-01-15',
        rover: { id: 5, name: 'Curiosity', landing_date: '2012-08-06', launch_date: '2011-11-26', status: 'active', max_sol: 4000, max_date: '2026-01-15', total_photos: 500000, cameras: ['MAST'] },
      });
      expect(result.id).toBe('mars_12345');
      expect(result.source).toBe('mars');
      expect(result.metadata.sol).toBe(1000);
      expect(result.metadata.camera_name).toBe('MAST');
    });
  });

  describe('normalizeEpic', () => {
    it('normalizes an EPIC image', () => {
      const result = normalizeEpic({
        identifier: 'epic_1b2c3d',
        caption: 'Earth from DSCOVR',
        image: 'epic_image_001',
        date: '2026-10-01 12:00:00',
        centroid_coordinates: { lat: 10.5, lon: -20.3 },
        dscovr_j2000_position: { x: 1, y: 2, z: 3 },
        lunar_j2000_position: { x: 4, y: 5, z: 6 },
        sun_j2000_position: { x: 7, y: 8, z: 9 },
        attitude_quaternions: [1, 0, 0, 0],
      });
      expect(result.id).toBe('epic_epic_1b2c3d');
      expect(result.source).toBe('epic');
      expect(result.fullUrl).toContain('epic.gsfc.nasa.gov');
      expect(result.metadata.centroid_lat).toBe(10.5);
    });
  });
});
`);

w('tests/env.test.ts', `import { describe, it, expect, beforeEach } from 'vitest';

describe('env validation', () => {
  beforeEach(() => {
    process.env.NASA_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  it('detects Supabase not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const mod = await import('@/lib/env');
    expect(mod.isSupabaseConfigured()).toBe(false);
  });

  it('detects Supabase configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    // Need to re-import to get fresh state
    delete require.cache[require.resolve('@/lib/env')];
    const mod = await import('@/lib/env');
    expect(mod.isSupabaseConfigured()).toBe(true);
  });
});
`);

w('tests/api-errors.test.ts', `import { describe, it, expect } from 'vitest';
import { errorEnvelope } from '@/lib/api/errors';

describe('API errors', () => {
  it('creates error envelope with code and message', () => {
    const result = errorEnvelope('BAD_REQUEST', 'Invalid input');
    expect(result.error.code).toBe('BAD_REQUEST');
    expect(result.error.message).toBe('Invalid input');
  });

  it('includes details when provided', () => {
    const result = errorEnvelope('VALIDATION_ERROR', 'Failed', [{ field: 'date', issue: 'required' }]);
    expect(result.error.details).toEqual([{ field: 'date', issue: 'required' }]);
  });

  it('omits details when not provided', () => {
    const result = errorEnvelope('NOT_FOUND', 'Not found');
    expect(result.error).not.toHaveProperty('details');
  });
});
`);

console.log('\n✅ All supporting files generated');
