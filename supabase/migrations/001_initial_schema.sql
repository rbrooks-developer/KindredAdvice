-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  bio           text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  ban_status    text not null default 'active' check (ban_status in ('active', 'warned', 'temp_banned', 'permanent_banned')),
  ban_expires_at timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user'
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  base_username := left(base_username, 20);
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HELP REQUESTS
-- ============================================================
create table public.help_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (length(title) between 5 and 200),
  body         text not null check (length(body) >= 10),
  category     text not null check (category in ('romantic', 'family', 'friendship', 'general')),
  is_private   boolean not null default false,
  status       text not null default 'open' check (status in ('open', 'resolved', 'hidden', 'deleted')),
  report_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.help_requests enable row level security;

-- ============================================================
-- REQUEST IMAGES
-- ============================================================
create table public.request_images (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.help_requests(id) on delete cascade,
  storage_path  text not null,
  display_order int not null default 0,
  report_count  int not null default 0,
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.request_images enable row level security;

-- ============================================================
-- REPLIES
-- ============================================================
create table public.replies (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references public.help_requests(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  body           text not null check (length(body) >= 5),
  is_admin_reply boolean not null default false,
  status         text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  report_count   int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.replies enable row level security;

-- ============================================================
-- REPORTS
-- ============================================================
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null check (target_type in ('request', 'reply', 'image')),
  target_id    uuid not null,
  reason       text not null,
  status       text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  admin_id     uuid references public.profiles(id),
  admin_notes  text,
  created_at   timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

alter table public.reports enable row level security;

-- ============================================================
-- BANS
-- ============================================================
create table public.bans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  admin_id   uuid not null references public.profiles(id),
  type       text not null check (type in ('warning', 'temp_ban', 'permanent_ban')),
  reason     text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.bans enable row level security;

-- ============================================================
-- TRIGGER: increment report_count and auto-hide at threshold
-- ============================================================
create or replace function public.handle_new_report()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.target_type = 'request' then
    update public.help_requests
    set report_count = report_count + 1,
        status = case when report_count + 1 >= 5 and status = 'open' then 'hidden' else status end
    where id = new.target_id;
  elsif new.target_type = 'reply' then
    update public.replies
    set report_count = report_count + 1,
        status = case when report_count + 1 >= 5 and status = 'visible' then 'hidden' else status end
    where id = new.target_id;
  elsif new.target_type = 'image' then
    update public.request_images
    set report_count = report_count + 1,
        is_hidden = case when report_count + 1 >= 5 then true else is_hidden end
    where id = new.target_id;
  end if;
  return new;
end;
$$;

create trigger on_report_created
  after insert on public.reports
  for each row execute procedure public.handle_new_report();

-- Updated_at trigger for help_requests
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger help_requests_updated_at
  before update on public.help_requests
  for each row execute procedure public.set_updated_at();

create trigger replies_updated_at
  before update on public.replies
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: check if current user is active (not banned)
create or replace function public.is_active_user()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and ban_status = 'active'
  );
$$;

-- PROFILES
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- HELP REQUESTS
create policy "requests_select_public" on public.help_requests
  for select using (
    (not is_private and status not in ('deleted'))
    or public.is_admin()
    or auth.uid() = user_id
  );

create policy "requests_insert_authenticated" on public.help_requests
  for insert with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and public.is_active_user()
  );

create policy "requests_update_own_or_admin" on public.help_requests
  for update using (
    auth.uid() = user_id or public.is_admin()
  );

create policy "requests_delete_admin" on public.help_requests
  for delete using (public.is_admin());

-- REQUEST IMAGES
create policy "images_select" on public.request_images
  for select using (
    exists (
      select 1 from public.help_requests r
      where r.id = request_id
        and (
          (not r.is_private and r.status != 'deleted')
          or public.is_admin()
          or auth.uid() = r.user_id
        )
    )
  );

create policy "images_insert" on public.request_images
  for insert with check (
    exists (
      select 1 from public.help_requests r
      where r.id = request_id and auth.uid() = r.user_id
    )
    and (
      select count(*) from public.request_images where request_id = request_id
    ) < 5
  );

create policy "images_delete" on public.request_images
  for delete using (
    exists (
      select 1 from public.help_requests r
      where r.id = request_id and (auth.uid() = r.user_id or public.is_admin())
    )
  );

create policy "images_update_admin" on public.request_images
  for update using (public.is_admin());

-- REPLIES
create policy "replies_select" on public.replies
  for select using (
    status != 'deleted'
    and exists (
      select 1 from public.help_requests r
      where r.id = request_id
        and (
          (not r.is_private and r.status not in ('deleted'))
          or public.is_admin()
          or auth.uid() = r.user_id
        )
    )
  );

create policy "replies_insert_public_requests" on public.replies
  for insert with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and public.is_active_user()
    and exists (
      select 1 from public.help_requests r
      where r.id = request_id
        and r.status = 'open'
        and (
          (not r.is_private)
          or public.is_admin()
        )
    )
  );

create policy "replies_update_own_or_admin" on public.replies
  for update using (auth.uid() = user_id or public.is_admin());

create policy "replies_delete_admin" on public.replies
  for delete using (public.is_admin());

-- REPORTS
create policy "reports_select" on public.reports
  for select using (
    auth.uid() = reporter_id or public.is_admin()
  );

create policy "reports_insert" on public.reports
  for insert with check (
    auth.uid() is not null
    and auth.uid() = reporter_id
  );

create policy "reports_update_admin" on public.reports
  for update using (public.is_admin());

-- BANS
create policy "bans_select_admin" on public.bans
  for select using (public.is_admin() or auth.uid() = user_id);

create policy "bans_insert_admin" on public.bans
  for insert with check (public.is_admin());

create policy "bans_update_admin" on public.bans
  for update using (public.is_admin());

-- ============================================================
-- STORAGE BUCKET (run in Supabase dashboard or via CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('request-images', 'request-images', true);
