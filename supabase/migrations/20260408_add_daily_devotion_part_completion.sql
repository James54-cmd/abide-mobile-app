alter table public.daily_devotion_progress
  add column if not exists quote_completed boolean not null default false,
  add column if not exists passage_completed boolean not null default false,
  add column if not exists devotional_completed boolean not null default false,
  add column if not exists prayer_completed boolean not null default false;

update public.daily_devotion_progress
set
  quote_completed = coalesce(quote_completed, is_completed),
  passage_completed = coalesce(passage_completed, is_completed),
  devotional_completed = coalesce(devotional_completed, is_completed),
  prayer_completed = coalesce(prayer_completed, is_completed)
where is_completed = true;
