create policy "admins manage editor profiles" on public.editor_profiles
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage sources" on public.sources
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage articles" on public.articles
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage citations" on public.article_sources
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage entities" on public.entities
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage entity links" on public.article_entities
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage ingestion" on public.ingestion_items
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins read reactions" on public.article_reactions
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins read analytics" on public.analytics_events
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage campaigns" on public.campaigns
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage banners" on public.banners
  for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins read agent runs" on public.agent_runs
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant all on public.editor_profiles, public.sources, public.articles, public.article_sources,
  public.entities, public.article_entities, public.ingestion_items, public.article_reactions,
  public.analytics_events, public.campaigns, public.banners, public.agent_runs to authenticated;

create index article_entities_entity_id_idx on public.article_entities(entity_id);
create index article_reactions_article_id_idx on public.article_reactions(article_id);
create index article_sources_source_id_idx on public.article_sources(source_id);
create index banners_campaign_id_idx on public.banners(campaign_id);
create index ingestion_duplicate_of_idx on public.ingestion_items(duplicate_of);
create index ingestion_source_id_idx on public.ingestion_items(source_id);
