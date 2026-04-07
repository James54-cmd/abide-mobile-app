create table if not exists public.daily_devotion_progress (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  is_completed boolean not null default false,
  completed_at timestamp with time zone,
  dismissed_at timestamp with time zone,
  is_favorite boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint daily_devotion_progress_pkey primary key (id),
  constraint daily_devotion_progress_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

create unique index if not exists daily_devotion_progress_user_id_date_key
  on public.daily_devotion_progress using btree (user_id, date);

create index if not exists daily_devotion_progress_user_id_updated_at_idx
  on public.daily_devotion_progress using btree (user_id, updated_at desc);

alter table public.daily_devotion_progress enable row level security;

drop policy if exists "Users can view their own daily devotion progress" on public.daily_devotion_progress;
create policy "Users can view their own daily devotion progress"
  on public.daily_devotion_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own daily devotion progress" on public.daily_devotion_progress;
create policy "Users can insert their own daily devotion progress"
  on public.daily_devotion_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own daily devotion progress" on public.daily_devotion_progress;
create policy "Users can update their own daily devotion progress"
  on public.daily_devotion_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own daily devotion progress" on public.daily_devotion_progress;
create policy "Users can delete their own daily devotion progress"
  on public.daily_devotion_progress
  for delete
  using (auth.uid() = user_id);

drop trigger if exists daily_devotion_progress_set_updated_at on public.daily_devotion_progress;
create trigger daily_devotion_progress_set_updated_at
before update on public.daily_devotion_progress
for each row execute function set_updated_at();
