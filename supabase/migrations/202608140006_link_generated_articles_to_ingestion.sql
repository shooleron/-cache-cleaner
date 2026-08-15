alter table public.articles
  add column if not exists ingestion_item_id uuid unique
    references public.ingestion_items(id) on delete set null,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create index if not exists articles_ingestion_item_idx
  on public.articles(ingestion_item_id)
  where ingestion_item_id is not null;
