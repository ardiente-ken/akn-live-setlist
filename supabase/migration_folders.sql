-- AKN Gigs: song folders (collections) + public songbooks
-- Requires: schema.sql (songs, is_admin(), set_updated_at()). Idempotent.

-- 1. Folders
create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  slug        text not null unique
                check (char_length(slug) <= 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 300),
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists folders_set_updated_at on public.folders;
create trigger folders_set_updated_at
  before update on public.folders
  for each row execute function public.set_updated_at();

-- 2. Folder membership (a song can be in many folders; position = order in the folder)
create table if not exists public.folder_songs (
  folder_id uuid not null references public.folders(id) on delete cascade,
  song_id   uuid not null references public.songs(id)   on delete cascade,
  position  integer not null default 0,
  added_at  timestamptz not null default now(),
  primary key (folder_id, song_id)
);

create index if not exists folder_songs_song_idx on public.folder_songs (song_id);

-- 3. Row level security: admins only. Anonymous users get NO direct table access;
--    the public songbook goes through the two functions below.
alter table public.folders      enable row level security;
alter table public.folder_songs enable row level security;

revoke all on public.folders, public.folder_songs from anon, authenticated;
grant select, insert, update, delete on public.folders, public.folder_songs to authenticated;

drop policy if exists "Admins can manage folders" on public.folders;
create policy "Admins can manage folders"
  on public.folders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can manage folder songs" on public.folder_songs;
create policy "Admins can manage folder songs"
  on public.folder_songs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4. Public read access: ONLY folders marked public, ONLY active songs.
create or replace function public.get_public_folder(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'folder', jsonb_build_object(
      'id', f.id, 'name', f.name, 'slug', f.slug, 'description', f.description
    ),
    'songs', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', s.id, 'title', s.title, 'artist', s.artist,
          'lyrics', s.lyrics, 'chords', s.chords, 'position', fs.position
        )
        order by fs.position, s.title
      )
      from public.folder_songs fs
      join public.songs s on s.id = fs.song_id
      where fs.folder_id = f.id and s.is_active
    ), '[]'::jsonb)
  )
  from public.folders f
  where f.slug = p_slug and f.is_public;
$$;

create or replace function public.list_public_folders()
returns table (id uuid, name text, slug text, description text, song_count integer)
language sql
stable
security definer
set search_path to 'public'
as $$
  select f.id, f.name, f.slug, f.description,
         (select count(*)::int
            from public.folder_songs fs
            join public.songs s on s.id = fs.song_id
           where fs.folder_id = f.id and s.is_active)
    from public.folders f
   where f.is_public
   order by f.name;
$$;

revoke all on function public.get_public_folder(text) from public;
revoke all on function public.list_public_folders()   from public;
grant execute on function public.get_public_folder(text) to anon, authenticated;
grant execute on function public.list_public_folders()   to anon, authenticated;
