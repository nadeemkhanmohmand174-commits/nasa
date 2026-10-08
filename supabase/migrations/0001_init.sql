-- Cosmos Vault — Initial Schema
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
