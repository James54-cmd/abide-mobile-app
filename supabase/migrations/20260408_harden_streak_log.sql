create table if not exists public.streak_log (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  date date not null,
  activity_type text,
  created_at timestamp with time zone default now(),
  constraint streak_log_pkey primary key (id),
  constraint streak_log_user_id_fkey foreign key (user_id) references public.profiles (id)
) tablespace pg_default;

delete from public.streak_log
where user_id is null;

alter table public.streak_log
  alter column user_id set not null,
  alter column created_at set not null;

alter table public.streak_log
  drop constraint if exists streak_log_user_id_fkey;

alter table public.streak_log
  add constraint streak_log_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.streak_log
  drop constraint if exists streak_log_activity_type_check;

alter table public.streak_log
  add constraint streak_log_activity_type_check
  check (
    activity_type is null
    or activity_type in (
      'daily_devotion_completed',
      'bible_read',
      'chat_opened',
      'prayer_completed'
    )
  );

create unique index if not exists streak_log_user_id_date_key
  on public.streak_log using btree (user_id, date);

create index if not exists streak_log_user_id_created_at_idx
  on public.streak_log using btree (user_id, created_at desc);

alter table public.streak_log enable row level security;

drop policy if exists "Users can view their own streak log" on public.streak_log;
create policy "Users can view their own streak log"
  on public.streak_log
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own streak log" on public.streak_log;
create policy "Users can insert their own streak log"
  on public.streak_log
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own streak log" on public.streak_log;
create policy "Users can update their own streak log"
  on public.streak_log
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own streak log" on public.streak_log;
create policy "Users can delete their own streak log"
  on public.streak_log
  for delete
  using (auth.uid() = user_id);
