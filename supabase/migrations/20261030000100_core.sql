create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

create table public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Guru',
  role text not null default 'teacher' check (role in ('teacher','admin')),
  status text not null default 'active' check (status in ('active','deletion_pending')),
  timezone text not null default 'Asia/Jakarta' check (timezone in ('Asia/Jakarta','Asia/Makassar','Asia/Jayapura')),
  deletion_requested_at timestamptz,
  revoked_before timestamptz not null default '1970-01-01',
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create function private.on_signup() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.accounts(id, display_name) values (new.id, coalesce(nullif(left(trim(new.raw_user_meta_data->>'display_name'),100),''),'Guru'));
  insert into public.workspaces(owner_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.on_signup() from public;
create trigger les_on_signup after insert on auth.users for each row execute function private.on_signup();

create table public.students (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 150),
  level text not null check (length(level) between 1 and 50),
  guardian_phone text not null default '',
  address text not null default '',
  notes text not null default '',
  source text not null default 'unknown' check (source in ('existing','profile','search','other','unknown')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique(id, workspace_id)
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 150),
  quota integer not null check (quota > 0),
  opening_used integer not null default 0 check (opening_used >= 0 and opening_used <= quota),
  agreed_price numeric(30,0) not null check (agreed_price >= 0),
  closed_at timestamptz,
  closure_reason text,
  created_at timestamptz not null default now(),
  unique(id, workspace_id),
  foreign key(student_id,workspace_id) references public.students(id,workspace_id) on delete cascade
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  package_id uuid not null,
  student_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  mode text not null check (mode in ('online','offline')),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','cancelled_charged')),
  cancelled_by text check (cancelled_by in ('teacher','guardian')),
  reason text not null default '',
  created_at timestamptz not null default now(),
  unique(id, workspace_id),
  foreign key(package_id,workspace_id) references public.packages(id,workspace_id) on delete cascade,
  foreign key(student_id,workspace_id) references public.students(id,workspace_id) on delete cascade,
  constraint teacher_schedule_no_overlap exclude using gist (workspace_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where (status in ('scheduled','completed'))
);

create table public.quota_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  package_id uuid not null,
  lesson_id uuid,
  delta integer not null check (delta <> 0),
  reason text not null check (length(trim(reason)) > 0),
  created_at timestamptz not null default now(),
  foreign key(package_id,workspace_id) references public.packages(id,workspace_id) on delete cascade,
  foreign key(lesson_id,workspace_id) references public.lessons(id,workspace_id) on delete cascade
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  package_id uuid not null,
  amount numeric(30,0) not null check (amount <> 0),
  kind text not null check (kind in ('payment','refund','correction')),
  reason text not null check (length(trim(reason)) > 0),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key(package_id,workspace_id) references public.packages(id,workspace_id) on delete cascade
);

create table public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null default now() + interval '7 days',
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key(student_id,workspace_id) references public.students(id,workspace_id) on delete cascade
);

create table public.teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  draft jsonb not null default '{}',
  published jsonb,
  review_status text not null default 'draft' check (review_status in ('draft','pending','approved','rejected')),
  visible boolean not null default false,
  admin_hidden boolean not null default false,
  accepting boolean not null default true,
  review_reason text not null default '',
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null,
  action text not null,
  entity_id uuid,
  reason text not null default '',
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table private.command_receipts (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null,
  action text not null,
  payload_hash text not null,
  result jsonb not null,
  primary key(workspace_id,request_id)
);

create index on public.students(workspace_id,archived);
create index on public.packages(workspace_id,student_id);
create index on public.lessons(workspace_id,starts_at);
create index on public.quota_events(package_id);
create index on public.payments(package_id);
create index on public.guardian_links(workspace_id,student_id);
create index on public.audit_events(workspace_id,created_at desc);

create function private.session_valid(allow_pending boolean default false) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.accounts a
    join auth.users u on u.id = a.id
    join auth.sessions s on s.user_id = a.id and s.id = nullif(auth.jwt()->>'session_id','')::uuid
    where a.id = auth.uid() and u.email_confirmed_at is not null
      and (a.status = 'active' or (allow_pending and a.status = 'deletion_pending'))
      and s.created_at > a.revoked_before and s.created_at <= now()
      and now() < s.created_at + case when a.role = 'admin' then interval '8 hours' else interval '7 days' end
  );
$$;

create function private.can_access(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select private.session_valid(false) and exists(select 1 from public.workspaces w join public.accounts a on a.id=w.owner_id where w.id=target and w.owner_id=auth.uid() and a.role='teacher');
$$;

create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select private.session_valid(false) and exists(select 1 from public.accounts where id=auth.uid() and role='admin');
$$;

create function private.require_user(allow_pending boolean default false) returns uuid language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.session_valid(allow_pending) then raise exception 'Sesi berakhir atau akses akun dibatasi. Silakan masuk kembali.' using errcode='42501'; end if;
  return auth.uid();
end;
$$;

create function public.account_context() returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare who uuid := private.require_user(true); result jsonb;
begin
  select to_jsonb(a)-'revoked_before' || jsonb_build_object('email',u.email,'workspace_id',w.id,'session_expires_at',s.created_at + case when a.role='admin' then interval '8 hours' else interval '7 days' end)
    into result from public.accounts a join auth.users u on u.id=a.id join public.workspaces w on w.owner_id=a.id
    join auth.sessions s on s.id=(auth.jwt()->>'session_id')::uuid where a.id=who;
  return result;
end;
$$;

create view public.package_summaries with (security_invoker=true) as
  select p.*, p.quota-p.opening_used+coalesce(q.delta,0)::integer as remaining,
    coalesce(m.received,0)::text as received,
    greatest(p.agreed_price-coalesce(m.received,0),0)::text as due,
    greatest(coalesce(m.received,0)-p.agreed_price,0)::text as overpaid
  from public.packages p
  left join lateral (select sum(delta) as delta from public.quota_events where package_id=p.id) q on true
  left join lateral (select sum(amount) as received from public.payments where package_id=p.id) m on true;

create function private.snapshot_for(target uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'students',coalesce((select jsonb_agg(to_jsonb(s) order by s.name) from public.students s where s.workspace_id=target),'[]'::jsonb),
    'packages',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('agreed_price',p.agreed_price::text) order by p.created_at desc) from public.package_summaries p where p.workspace_id=target),'[]'::jsonb),
    'lessons',coalesce((select jsonb_agg(to_jsonb(l) order by l.starts_at) from public.lessons l where l.workspace_id=target),'[]'::jsonb),
    'payments',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('amount',p.amount::text) order by p.paid_at desc) from public.payments p where p.workspace_id=target),'[]'::jsonb),
    'quota_events',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at) from public.quota_events q where q.workspace_id=target),'[]'::jsonb),
    'guardian_links',coalesce((select jsonb_agg(to_jsonb(g)-'token_hash') from public.guardian_links g where g.workspace_id=target),'[]'::jsonb),
    'profile',(select to_jsonb(p) from public.teacher_profiles p where p.workspace_id=target),
    'audit_events',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at desc) from (select * from public.audit_events where workspace_id=target order by created_at desc limit 200) a),'[]'::jsonb)
  );
$$;

create function public.workspace_snapshot() returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare who uuid:=private.require_user(false); target uuid;
begin
  select id into target from public.workspaces where owner_id=who;
  if not private.can_access(target) then raise exception 'Ruang kerja tidak dapat diakses.' using errcode='42501'; end if;
  return private.snapshot_for(target);
end;
$$;

do $$
declare name text;
begin
  foreach name in array array['accounts','workspaces','students','packages','lessons','quota_events','payments','guardian_links','teacher_profiles','audit_events'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('revoke all on public.%I from anon, authenticated',name);
    execute format('grant select on public.%I to authenticated',name);
    if name='accounts' then
      execute 'create policy read_own on public.accounts for select to authenticated using (id=auth.uid() and private.session_valid(true))';
    elsif name='workspaces' then
      execute 'create policy read_own on public.workspaces for select to authenticated using (private.can_access(id))';
    elsif name='teacher_profiles' then
      execute 'create policy read_own on public.teacher_profiles for select to authenticated using (private.can_access(workspace_id) or private.is_admin())';
    else
      execute format('create policy read_own on public.%I for select to authenticated using (private.can_access(workspace_id))',name);
    end if;
  end loop;
end;
$$;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on public.package_summaries from public, anon, authenticated;
grant select on public.package_summaries to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.session_valid(boolean),private.can_access(uuid),private.is_admin() to authenticated;
revoke all on function public.account_context(),public.workspace_snapshot() from public, anon;
grant execute on function public.account_context(),public.workspace_snapshot() to authenticated;
