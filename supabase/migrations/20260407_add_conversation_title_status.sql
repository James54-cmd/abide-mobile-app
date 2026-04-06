-- Add title status tracking for smart conversation titles
alter table public.chat_conversations 
add column title_status text not null default 'pending';

-- Add constraint to ensure valid title status values
alter table public.chat_conversations 
add constraint chat_conversations_title_status_check 
check (title_status in ('pending', 'generated', 'locked', 'user_edited'));

-- Add message count for tracking title generation logic
alter table public.chat_conversations 
add column message_count integer not null default 0;

-- Create index for performance on title status queries
create index idx_chat_conversations_title_status on public.chat_conversations (title_status);

-- Update existing conversations to have pending status if they have "New Conversation" title
update public.chat_conversations 
set title_status = 'pending' 
where title = 'New Conversation';

-- Update existing conversations to have generated status if they have other titles
update public.chat_conversations 
set title_status = 'generated' 
where title != 'New Conversation';