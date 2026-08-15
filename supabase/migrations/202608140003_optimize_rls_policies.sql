drop policy "editors can read their profile" on public.editor_profiles;
drop policy "admins manage editor profiles" on public.editor_profiles;
drop policy "admins manage sources" on public.sources;
drop policy "admins manage articles" on public.articles;
drop policy "admins manage citations" on public.article_sources;
drop policy "admins manage entities" on public.entities;
drop policy "admins manage entity links" on public.article_entities;
drop policy "admins manage ingestion" on public.ingestion_items;
drop policy "admins read reactions" on public.article_reactions;
drop policy "admins read analytics" on public.analytics_events;
drop policy "admins manage campaigns" on public.campaigns;
drop policy "admins manage banners" on public.banners;
drop policy "admins read agent runs" on public.agent_runs;

drop policy "published articles are public" on public.articles;
drop policy "published entities are public" on public.entities;
drop policy "active sources are public" on public.sources;
drop policy "published article citations are public" on public.article_sources;
drop policy "published entity links are public" on public.article_entities;
drop policy "active banners are public" on public.banners;

create policy "editor profiles readable by owner or admin" on public.editor_profiles
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  );

create policy "admins insert editor profiles" on public.editor_profiles
  for insert to authenticated
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins update editor profiles" on public.editor_profiles
  for update to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins delete editor profiles" on public.editor_profiles
  for delete to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "admins manage sources" on public.sources for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage articles" on public.articles for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage citations" on public.article_sources for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage entities" on public.entities for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage entity links" on public.article_entities for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage ingestion" on public.ingestion_items for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins read reactions" on public.article_reactions for select to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins read analytics" on public.analytics_events for select to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage campaigns" on public.campaigns for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins manage banners" on public.banners for all to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
  with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
create policy "admins read agent runs" on public.agent_runs for select to authenticated
  using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "published articles are public" on public.articles for select to anon
  using (status = 'published');
create policy "published entities are public" on public.entities for select to anon
  using (published = true);
create policy "active sources are public" on public.sources for select to anon
  using (active = true);
create policy "published article citations are public" on public.article_sources for select to anon
  using (exists (select 1 from public.articles where articles.id = article_sources.article_id and articles.status = 'published'));
create policy "published entity links are public" on public.article_entities for select to anon
  using (exists (select 1 from public.articles where articles.id = article_entities.article_id and articles.status = 'published'));
create policy "active banners are public" on public.banners for select to anon
  using (active = true);
