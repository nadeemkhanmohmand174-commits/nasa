-- Cosmos Vault — Functions and Triggers

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
