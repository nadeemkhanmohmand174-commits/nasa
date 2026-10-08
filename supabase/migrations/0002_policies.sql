-- Cosmos Vault — RLS Policies

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
