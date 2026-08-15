create extension if not exists pgcrypto;

create type public.content_status as enum ('collected', 'reviewing', 'draft', 'scheduled', 'published', 'rejected');
create type public.entity_type as enum ('term', 'brand', 'person', 'institution');

create table public.editor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin', 'editor', 'analyst')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  source_type text not null default 'publication',
  trust_score numeric(3,1) not null default 5 check (trust_score between 0 and 10),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  category text not null,
  status public.content_status not null default 'collected',
  evidence_level text,
  scientific_confidence numeric(3,1),
  cover_image_url text,
  original_language text,
  original_published_at timestamptz,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_sources (
  article_id uuid not null references public.articles(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  source_url text not null,
  citation_label text,
  is_primary boolean not null default false,
  primary key (article_id, source_url)
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  type public.entity_type not null,
  slug text not null unique,
  name_he text not null,
  name_en text,
  aliases text[] not null default '{}',
  short_definition text not null,
  body text not null,
  seo_title text,
  seo_description text,
  evidence_notes text,
  reviewed_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_entities (
  article_id uuid not null references public.articles(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  relevance numeric(3,2) not null default 1,
  primary key (article_id, entity_id)
);

create table public.ingestion_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  source_url text not null unique,
  raw_title text,
  raw_content text,
  language text,
  discovered_at timestamptz not null default now(),
  published_at timestamptz,
  status public.content_status not null default 'collected',
  duplicate_of uuid references public.ingestion_items(id),
  agent_score numeric(4,3),
  rejection_reason text
);

create table public.article_reactions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  reaction boolean not null,
  feedback text,
  anonymous_id text,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  article_id uuid references public.articles(id) on delete set null,
  event_name text not null,
  anonymous_id text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  placement text not null,
  image_url text not null,
  target_url text not null,
  alt_text text not null,
  category text,
  active boolean not null default true,
  weight integer not null default 1
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  job_type text not null,
  status text not null,
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index articles_status_published_idx on public.articles(status, published_at desc);
create index entities_type_published_idx on public.entities(type, published, name_he);
create index analytics_article_created_idx on public.analytics_events(article_id, created_at desc);
create index ingestion_status_discovered_idx on public.ingestion_items(status, discovered_at desc);

alter table public.sources enable row level security;
alter table public.editor_profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_sources enable row level security;
alter table public.entities enable row level security;
alter table public.article_entities enable row level security;
alter table public.ingestion_items enable row level security;
alter table public.article_reactions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.campaigns enable row level security;
alter table public.banners enable row level security;
alter table public.agent_runs enable row level security;

create policy "editors can read their profile" on public.editor_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id and active = true);

create policy "published articles are public" on public.articles
  for select to anon, authenticated
  using (status = 'published');

create policy "published entities are public" on public.entities
  for select to anon, authenticated
  using (published = true);

create policy "active sources are public" on public.sources
  for select to anon, authenticated
  using (active = true);

create policy "published article citations are public" on public.article_sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.articles
    where articles.id = article_sources.article_id
      and articles.status = 'published'
  ));

create policy "published entity links are public" on public.article_entities
  for select to anon, authenticated
  using (exists (
    select 1 from public.articles
    where articles.id = article_entities.article_id
      and articles.status = 'published'
  ));

create policy "active banners are public" on public.banners
  for select to anon, authenticated
  using (active = true);

create policy "public can submit reactions" on public.article_reactions
  for insert to anon, authenticated
  with check (true);

create policy "public can submit analytics" on public.analytics_events
  for insert to anon, authenticated
  with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.articles, public.entities, public.sources, public.article_sources, public.article_entities, public.banners to anon, authenticated;
grant select on public.editor_profiles to authenticated;
grant insert on public.article_reactions, public.analytics_events to anon, authenticated;
grant usage, select on sequence public.analytics_events_id_seq to anon, authenticated;
