-- =====================================================================
-- AKN Gigs: database schema snapshot
-- Source: live Supabase project "akn-live-setlist" (wxquotmrxnhzbnfihomi)
-- Captured: 2026-10-14. Schema only: no rows (songs, requests, admins are not included).
--
-- Re-create on a new project: Supabase -> SQL Editor -> paste all -> Run.
-- Idempotent: safe to re-run (tables/columns use IF NOT EXISTS; policies,
-- triggers are dropped and re-created).
--
-- After running, make yourself admin (see section 9).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. songs
-- ---------------------------------------------------------------------
create table if not exists public.songs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  lyrics     text not null default '',
  chords     text not null default '',
  updated_at timestamptz not null default now()
);

-- (for projects that already had the original 5-column songs table)
alter table public.songs
  add column if not exists lyrics     text        not null default '',
  add column if not exists chords     text        not null default '',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists songs_active_idx on public.songs (is_active);

-- ---------------------------------------------------------------------
-- 2. admins  (allow-list of users who can manage songs and the queue)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id)
);

-- ---------------------------------------------------------------------
-- 3. functions + triggers
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. song_requests
-- ---------------------------------------------------------------------
create table if not exists public.song_requests (
  id             uuid primary key default gen_random_uuid(),
  song_id        uuid references public.songs(id),
  title          text not null check (char_length(title) between 1 and 120),
  artist         text not null default '' check (char_length(artist) <= 120),
  requester_name text not null default '' check (char_length(requester_name) <= 40),
  status         text not null default 'pending'
                   check (status in ('pending', 'played', 'dismissed')),
  created_at     timestamptz not null default now(),
  handled_at     timestamptz
);

create index if not exists song_requests_status_created_idx
  on public.song_requests (status, created_at);

-- ---------------------------------------------------------------------
-- 5. Row level security: ON for every table
-- ---------------------------------------------------------------------
alter table public.songs         enable row level security;
alter table public.admins        enable row level security;
alter table public.song_requests enable row level security;

-- ---------------------------------------------------------------------
-- 6. Grants (least privilege)
--    Supabase grants ALL privileges on new public tables to anon and
--    authenticated by default; RLS is then the only gate. This tightens it
--    to exactly what the app uses. Safe to run on the live project too.
-- ---------------------------------------------------------------------
revoke all on public.songs, public.admins, public.song_requests from anon, authenticated;

grant select                         on public.songs         to anon;
grant select, insert, update, delete on public.songs         to authenticated;
grant select                         on public.admins        to authenticated;
grant select, insert                 on public.song_requests to anon;
grant select, insert, update, delete on public.song_requests to authenticated;

-- ---------------------------------------------------------------------
-- 7. Policies
-- ---------------------------------------------------------------------

-- songs: public reads active songs; admins have full access
drop policy if exists "Public can read active songs" on public.songs;
create policy "Public can read active songs"
  on public.songs for select to anon
  using (is_active = true);

drop policy if exists "Admins can read all songs" on public.songs;
create policy "Admins can read all songs"
  on public.songs for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert songs" on public.songs;
create policy "Admins can insert songs"
  on public.songs for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update songs" on public.songs;
create policy "Admins can update songs"
  on public.songs for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete songs" on public.songs;
create policy "Admins can delete songs"
  on public.songs for delete to authenticated
  using (public.is_admin());

-- admins: a signed-in user can see only their own row
drop policy if exists "Admins can read own row" on public.admins;
create policy "Admins can read own row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- song_requests: anyone reads (needed for realtime) and creates pending
-- requests (queue capped at 100 pending); only admins update/delete
drop policy if exists "Anyone can read requests" on public.song_requests;
create policy "Anyone can read requests"
  on public.song_requests for select to anon, authenticated
  using (true);

drop policy if exists "Anyone can create pending requests" on public.song_requests;
create policy "Anyone can create pending requests"
  on public.song_requests for insert to anon, authenticated
  with check (
    status = 'pending'
    and handled_at is null
    and (select count(*) from public.song_requests where status = 'pending') < 100
  );

drop policy if exists "Admins can update requests" on public.song_requests;
create policy "Admins can update requests"
  on public.song_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete requests" on public.song_requests;
create policy "Admins can delete requests"
  on public.song_requests for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 8. Realtime (live request queue). Replica identity stays DEFAULT.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'song_requests'
  ) then
    alter publication supabase_realtime add table public.song_requests;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 9. Make yourself admin (once, per project)
--    a) Dashboard -> Authentication -> Users -> Add user (email + password)
--    b) Uncomment, put your email in, run:
-- ---------------------------------------------------------------------
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR_EMAIL_HERE'
--   on conflict do nothing;