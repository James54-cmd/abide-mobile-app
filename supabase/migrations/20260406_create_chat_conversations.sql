-- Create conversations table
create table public.chat_conversations (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  title text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint chat_conversations_pkey primary key (id),
  constraint chat_conversations_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- Create messages table (already exists based on user's schema)
-- This is the table structure you provided:
-- create table public.chat_messages (
--   id bigserial not null,
--   conversation_id uuid not null,
--   user_id uuid not null,
--   role text not null,
--   content text not null default ''::text,
--   encouragement jsonb null,
--   created_at timestamp with time zone not null default now(),
--   constraint chat_messages_pkey primary key (id),
--   constraint chat_messages_conversation_id_fkey foreign KEY (conversation_id) references chat_conversations (id) on delete CASCADE,
--   constraint chat_messages_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
--   constraint chat_messages_role_check check (
--     (
--       role = any (array['user'::text, 'assistant'::text])
--     )
--   )
-- ) TABLESPACE pg_default;

-- Enable RLS on conversations
alter table public.chat_conversations enable row level security;

-- RLS policies for conversations - users can only see their own
create policy "Users can view their own conversations" on public.chat_conversations
  for select using (auth.uid() = user_id);

create policy "Users can create their own conversations" on public.chat_conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations" on public.chat_conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own conversations" on public.chat_conversations
  for delete using (auth.uid() = user_id);

-- RLS policies for messages - users can only see messages from their conversations
create policy "Users can view messages from their conversations" on public.chat_messages
  for select using (
    auth.uid() in (
      select user_id from public.chat_conversations 
      where id = conversation_id
    )
  );

create policy "Users can create messages in their conversations" on public.chat_messages
  for insert with check (
    auth.uid() in (
      select user_id from public.chat_conversations 
      where id = conversation_id
    )
  );

-- Update function for conversations updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at when conversations are modified
create trigger chat_conversations_updated_at
  before update on public.chat_conversations
  for each row execute procedure public.handle_updated_at();

-- Index for performance
create index if not exists chat_conversations_user_id_idx on public.chat_conversations using btree (user_id);
create index if not exists chat_conversations_updated_at_idx on public.chat_conversations using btree (updated_at desc);