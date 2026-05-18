-- ============================================================
-- HeritageLKK – Archives table
-- Run this in the Supabase SQL Editor (or via Supabase CLI:
--   supabase db push)
-- ============================================================

-- 1. Table
create table if not exists public.archives (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),

  -- owner (nullable so anonymous AI-generated archives still work)
  user_id     uuid        references auth.users(id) on delete set null,

  -- content fields
  title       text        not null,
  subtitle    text,
  location    text,
  category    text,
  intro       text,   -- short intro / italic quote
  content     text    -- full markdown body (AI-generated archives)
);

-- 2. Index – used by Archive.tsx: .order("created_at", { ascending: false })
create index if not exists archives_created_at_idx
  on public.archives (created_at desc);

-- 3. Row-Level Security
alter table public.archives enable row level security;

-- Anyone (logged-in or not) can read
create policy "archives_select_public"
  on public.archives
  for select
  to anon, authenticated
  using (true);

-- Logged-in users can insert their own rows
create policy "archives_insert_own"
  on public.archives
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update only their own rows
create policy "archives_update_own"
  on public.archives
  for update
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own rows
create policy "archives_delete_own"
  on public.archives
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Optional: seed a couple of records so the list isn't empty
-- ============================================================
insert into public.archives (title, subtitle, location, category, intro, content)
values
  (
    'Traditional Mask Carving',
    'ANCIENT CRAFTSMANSHIP',
    'AMBALANGODA, SRI LANKA',
    'Ancient Sites',
    'In the coastal town of Ambalangoda, the ancient art of mask making has been preserved through generations.',
    null
  ),
  (
    'Palm Leaf Manuscripts',
    'ORAL HISTORY',
    'SRI LANKA',
    'Oral History',
    'Centuries of knowledge were inscribed on palm leaves by scholar-monks across the island.',
    null
  )
on conflict do nothing;
