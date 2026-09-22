-- 在 Supabase SQL Editor 執行。只新增本網站使用的 catalog_* 資料表。
begin;

create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.catalog_products (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  name text not null check (char_length(trim(name)) between 1 and 100),
  category text not null check (char_length(trim(category)) between 1 and 50),
  spec text not null default '' check (char_length(spec) <= 200),
  description text not null default '' check (char_length(description) <= 2000),
  price integer not null check (price between 0 and 100000000),
  stock integer not null default 0 check (stock between 0 and 1000000),
  image text not null default 'images/mug.jpg' check (image ~ '^https://' or image ~ '^images/[A-Za-z0-9._/-]+$'),
  tag text not null default '' check (char_length(tag) <= 30),
  is_active boolean not null default false,
  sort_order integer not null default 0 check (sort_order between -1000000 and 1000000),
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create table if not exists public.catalog_settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null default '日常選物' check (char_length(trim(shop_name)) between 1 and 60),
  line_id text not null default '' check (line_id = '' or line_id ~ '^@[A-Za-z0-9._-]{1,100}$'),
  demo_mode boolean not null default true,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create or replace function public.catalog_touch_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.catalog_touch_version() from public, anon, authenticated;
drop trigger if exists catalog_products_version on public.catalog_products;
create trigger catalog_products_version before update on public.catalog_products
for each row execute function public.catalog_touch_version();
drop trigger if exists catalog_settings_version on public.catalog_settings;
create trigger catalog_settings_version before update on public.catalog_settings
for each row execute function public.catalog_touch_version();

alter table public.catalog_admins enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_settings enable row level security;

revoke all on public.catalog_admins from anon, authenticated;
revoke all on public.catalog_products from anon, authenticated;
revoke all on public.catalog_settings from anon, authenticated;
grant select on public.catalog_admins to authenticated;
grant select on public.catalog_products, public.catalog_settings to anon, authenticated;
grant insert, update on public.catalog_products to authenticated;
grant update on public.catalog_settings to authenticated;

drop policy if exists catalog_admin_self on public.catalog_admins;
create policy catalog_admin_self on public.catalog_admins for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists catalog_products_read on public.catalog_products;
create policy catalog_products_read on public.catalog_products for select to anon, authenticated
using (is_active);
drop policy if exists catalog_products_admin_read on public.catalog_products;
create policy catalog_products_admin_read on public.catalog_products for select to authenticated
using (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())));
drop policy if exists catalog_products_insert on public.catalog_products;
create policy catalog_products_insert on public.catalog_products for insert to authenticated
with check (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())));
drop policy if exists catalog_products_update on public.catalog_products;
create policy catalog_products_update on public.catalog_products for update to authenticated
using (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())))
with check (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())));

drop policy if exists catalog_settings_read on public.catalog_settings;
create policy catalog_settings_read on public.catalog_settings for select to anon, authenticated using (true);
drop policy if exists catalog_settings_update on public.catalog_settings;
create policy catalog_settings_update on public.catalog_settings for update to authenticated
using (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())))
with check (exists(select 1 from public.catalog_admins where user_id = (select auth.uid())));

insert into public.catalog_settings(id) values (1) on conflict (id) do nothing;
commit;

-- 管理員設定：先在 Authentication → Users → Add user 建立 Email/密碼帳號。
-- 複製該帳號的 User UID，將下列 UUID 換成實際值後，單獨執行：
-- insert into public.catalog_admins(user_id) values ('管理員的 User UID') on conflict do nothing;
-- 一般註冊帳號不會自動取得管理員權限。前端沒有新增管理員的權限。
