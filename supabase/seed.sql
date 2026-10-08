-- Cosmos Vault — Seed Data
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
