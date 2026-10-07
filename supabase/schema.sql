-- Run in Supabase: SQL Editor -> New query -> Run

create table if not exists public.songs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists songs_active_idx on public.songs (is_active);

-- Public read-only access to active songs. Edits happen in the Supabase dashboard.
alter table public.songs enable row level security;

create policy "Public can read active songs"
  on public.songs for select
  to anon
  using (is_active = true);

-- Optional starter rows
insert into public.songs (title, artist) values
  ('Black Loafers', 'AKN'),
  ('Pasaway', 'AKN');
