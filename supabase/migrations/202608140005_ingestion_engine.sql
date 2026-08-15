alter table public.sources
  add column if not exists feed_url text,
  add column if not exists language text not null default 'en',
  add column if not exists topics text[] not null default '{}',
  add column if not exists scan_interval_hours integer not null default 24
    check (scan_interval_hours between 1 and 168),
  add column if not exists auto_publish boolean not null default false,
  add column if not exists last_scanned_at timestamptz,
  add column if not exists last_scan_status text,
  add column if not exists last_scan_error text,
  add column if not exists items_last_scan integer not null default 0;

alter table public.ingestion_items
  add column if not exists image_url text,
  add column if not exists quality_details jsonb not null default '{}';

create index if not exists sources_scan_due_idx
  on public.sources(active, last_scanned_at)
  where active = true and feed_url is not null;

create index if not exists ingestion_score_discovered_idx
  on public.ingestion_items(agent_score desc, discovered_at desc);

comment on column public.sources.auto_publish is
  'Reserved for a future reviewed auto-publishing flow. The ingestion engine never publishes directly.';
