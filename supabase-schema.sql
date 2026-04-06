-- TaskFlow shared workspace state
-- Run this in Supabase SQL Editor

create table if not exists workspace_state (
  id text primary key default 'main',
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Allow all authenticated and anonymous users to read/write
alter table workspace_state enable row level security;

create policy "Anyone can read workspace" on workspace_state
  for select using (true);

create policy "Anyone can update workspace" on workspace_state
  for update using (true);

create policy "Anyone can insert workspace" on workspace_state
  for insert with check (true);

-- Enable realtime
alter publication supabase_realtime add table workspace_state;

-- Insert initial empty row
insert into workspace_state (id, data)
values ('main', '{}')
on conflict (id) do nothing;
