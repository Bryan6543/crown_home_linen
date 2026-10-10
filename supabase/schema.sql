-- CrownHomeLinen schema
-- Run this once in the Supabase SQL editor, then sign in at /admin/login.
-- The first account becomes the owner. Load the sample catalog from House settings.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('admin', 'staff', 'customer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned text;
begin
  if exists (select 1 from public.profiles where role = 'admin') then
    assigned := 'customer';
  else
    assigned := 'admin';
  end if;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    assigned
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.settings (
  id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  visible boolean not null default true,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  status text not null default 'active',
  category_id text,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id text primary key,
  active boolean not null default true,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.pages (
  id text primary key,
  slug text unique not null,
  published boolean not null default true,
  doc jsonb not null
);

create table if not exists public.sections (
  id text primary key,
  page_slug text not null,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.testimonials (
  id text primary key,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.faqs (
  id text primary key,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.navigation (
  id text primary key,
  sort int not null default 0,
  doc jsonb not null
);

create table if not exists public.orders (
  id text primary key,
  number text unique,
  status text not null default 'new',
  client_token text unique,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id text primary key,
  status text not null default 'new',
  client_token text unique,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id text primary key,
  type text not null,
  path text not null default '/',
  created_at timestamptz not null default now(),
  doc jsonb not null
);

create table if not exists public.subscribers (
  id text primary key,
  email text unique not null,
  status text not null default 'active',
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key,
  status text not null default 'draft',
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id text primary key,
  campaign_id text,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id text primary key,
  doc jsonb not null
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists products_status_idx on public.products (status);

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.navigation enable row level security;
alter table public.orders enable row level security;
alter table public.inquiries enable row level security;
alter table public.customers enable row level security;
alter table public.analytics_events enable row level security;

create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
create policy profiles_staff_update on public.profiles
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy settings_read on public.settings for select to anon, authenticated using (true);
create policy settings_write on public.settings for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy categories_read on public.categories for select to anon, authenticated using (visible = true or public.is_staff());
create policy categories_write on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy products_read on public.products for select to anon, authenticated using (status = 'active' or public.is_staff());
create policy products_write on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy banners_read on public.banners for select to anon, authenticated using (active = true or public.is_staff());
create policy banners_write on public.banners for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy pages_read on public.pages for select to anon, authenticated using (published = true or public.is_staff());
create policy pages_write on public.pages for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy sections_read on public.sections for select to anon, authenticated using (true);
create policy sections_write on public.sections for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy testimonials_read on public.testimonials for select to anon, authenticated using (true);
create policy testimonials_write on public.testimonials for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy faqs_read on public.faqs for select to anon, authenticated using (true);
create policy faqs_write on public.faqs for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy navigation_read on public.navigation for select to anon, authenticated using (true);
create policy navigation_write on public.navigation for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy orders_insert on public.orders for insert to anon, authenticated with check (true);
create policy orders_staff_read on public.orders for select to authenticated using (public.is_staff());
create policy orders_staff_update on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy inquiries_insert on public.inquiries for insert to anon, authenticated with check (true);
create policy inquiries_staff_read on public.inquiries for select to authenticated using (public.is_staff());
create policy inquiries_staff_update on public.inquiries for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy customers_staff on public.customers for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy events_insert on public.analytics_events for insert to anon, authenticated with check (true);
create policy events_staff_read on public.analytics_events for select to authenticated using (public.is_staff());

alter table public.subscribers enable row level security;
alter table public.campaigns enable row level security;
alter table public.deliveries enable row level security;
alter table public.templates enable row level security;

create policy subscribers_staff on public.subscribers for all to authenticated using (public.is_staff()) with check (public.is_staff());

create or replace function public.subscribe_address(p_email text, p_name text, p_source text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.subscribers%rowtype;
  new_token text := replace(gen_random_uuid()::text, '-', '');
  nowts text := now()::text;
  doc jsonb;
begin
  select * into existing from public.subscribers where email = lower(trim(p_email));
  if existing.id is not null and existing.status = 'active' then
    return jsonb_build_object('result', 'already', 'subscriber', existing.doc);
  end if;
  if existing.id is not null then
    doc := existing.doc || jsonb_build_object(
      'name', coalesce(nullif(trim(p_name), ''), existing.doc->>'name'),
      'status', 'active',
      'token', new_token,
      'source', p_source,
      'resubscribeCount', coalesce((existing.doc->>'resubscribeCount')::int, 0) + 1,
      'subscribedAt', nowts,
      'unsubscribedAt', null
    );
    update public.subscribers set status = 'active', doc = doc where id = existing.id;
    return jsonb_build_object('result', 'resubscribed', 'subscriber', doc);
  end if;
  doc := jsonb_build_object(
    'id', gen_random_uuid()::text,
    'email', lower(trim(p_email)),
    'name', trim(coalesce(p_name, '')),
    'status', 'active',
    'token', new_token,
    'source', p_source,
    'resubscribeCount', 0,
    'subscribedAt', nowts,
    'unsubscribedAt', null,
    'createdAt', nowts
  );
  insert into public.subscribers (id, email, status, doc)
  values (doc->>'id', doc->>'email', 'active', doc);
  return jsonb_build_object('result', 'created', 'subscriber', doc);
end;
$$;

create or replace function public.unsubscribe_token(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.subscribers%rowtype;
begin
  select * into existing from public.subscribers where doc->>'token' = p_token;
  if existing.id is null then
    return 'missing';
  end if;
  if existing.status = 'unsubscribed' then
    return 'already';
  end if;
  update public.subscribers
  set status = 'unsubscribed',
      doc = existing.doc || jsonb_build_object('status', 'unsubscribed', 'unsubscribedAt', now()::text)
  where id = existing.id;
  return 'ok';
end;
$$;

create or replace function public.lookup_order(order_number text, phone_digits text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select (doc - 'staffNotes' - 'clientToken')
  from public.orders
  where lower(doc->>'number') = lower(order_number)
    and regexp_replace(coalesce(doc->>'phone', ''), '\D', '', 'g') = phone_digits
  limit 1;
$$;

grant execute on function public.subscribe_address(text, text, text) to anon, authenticated;
grant execute on function public.unsubscribe_token(text) to anon, authenticated;
grant execute on function public.lookup_order(text, text) to anon, authenticated;
create policy campaigns_staff on public.campaigns for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy deliveries_staff on public.deliveries for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy templates_staff on public.templates for all to authenticated using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;

create policy catalog_public_read on storage.objects
  for select to public using (bucket_id = 'catalog');
create policy catalog_staff_write on storage.objects
  for insert to authenticated with check (bucket_id = 'catalog' and public.is_staff());
create policy catalog_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'catalog' and public.is_staff());
create policy catalog_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'catalog' and public.is_staff());

create or replace function public.sync_customer_from_doc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  phone_raw text := coalesce(new.doc ->> 'phone', '');
  phone_id text := regexp_replace(phone_raw, '\D', '', 'g');
  person_name text := coalesce(new.doc ->> 'customerName', new.doc ->> 'name', '');
  person_email text := coalesce(new.doc ->> 'email', '');
  existing jsonb;
  order_count int;
  inquiry_count int;
begin
  if phone_id = '' then
    return new;
  end if;
  select doc into existing from public.customers where id = phone_id;
  if tg_table_name = 'orders' then
    order_count := coalesce((existing ->> 'orderCount')::int, 0) + 1;
    inquiry_count := coalesce((existing ->> 'inquiryCount')::int, 0);
  else
    order_count := coalesce((existing ->> 'orderCount')::int, 0);
    inquiry_count := coalesce((existing ->> 'inquiryCount')::int, 0) + 1;
  end if;
  insert into public.customers (id, doc)
  values (
    phone_id,
    jsonb_build_object(
      'id', phone_id,
      'name', person_name,
      'phone', phone_raw,
      'email', person_email,
      'notes', coalesce(existing ->> 'notes', ''),
      'orderCount', order_count,
      'inquiryCount', inquiry_count,
      'createdAt', coalesce(existing ->> 'createdAt', now()::text),
      'lastSeenAt', now()::text
    )
  )
  on conflict (id) do update set doc = excluded.doc, updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_sync_customer on public.orders;
create trigger orders_sync_customer
  after insert on public.orders
  for each row execute function public.sync_customer_from_doc();

drop trigger if exists inquiries_sync_customer on public.inquiries;
create trigger inquiries_sync_customer
  after insert on public.inquiries
  for each row execute function public.sync_customer_from_doc();
