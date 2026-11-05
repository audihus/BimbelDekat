-- Browser receives an opaque HttpOnly cookie. Provider credentials stay encrypted on the server.
create table private.web_sessions (
  token_hash text primary key check(token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references public.accounts(id) on delete cascade,
  auth_session_id uuid not null,
  sealed_tokens text not null,
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create index on private.web_sessions(user_id);
alter table private.web_sessions enable row level security;
revoke all on private.web_sessions from public,anon,authenticated;

create function public.put_server_session(p_hash text,p_user uuid,p_auth_session uuid,p_sealed text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare expires timestamptz;
begin
  select s.created_at + case when a.role='admin' then interval '8 hours' else interval '7 days' end into expires
    from auth.sessions s join public.accounts a on a.id=s.user_id join auth.users u on u.id=a.id
    where s.id=p_auth_session and s.user_id=p_user and s.created_at>a.revoked_before and u.email_confirmed_at is not null;
  if expires is null or expires<=now() then raise exception 'Sesi tidak dapat dimulai.'; end if;
  insert into private.web_sessions(token_hash,user_id,auth_session_id,sealed_tokens) values(p_hash,p_user,p_auth_session,p_sealed);
  return jsonb_build_object('expires_at',expires);
end;
$$;

create function public.get_server_session(p_hash text) returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('sealed_tokens',w.sealed_tokens,'version',w.version,'user_id',w.user_id,'auth_session_id',w.auth_session_id)
  from private.web_sessions w join auth.sessions s on s.id=w.auth_session_id and s.user_id=w.user_id
  join public.accounts a on a.id=w.user_id join auth.users u on u.id=a.id
  where w.token_hash=p_hash and u.email_confirmed_at is not null and s.created_at>a.revoked_before
    and s.created_at<=now() and now()<s.created_at+case when a.role='admin' then interval '8 hours' else interval '7 days' end;
$$;

create function public.rotate_server_session(p_hash text,p_version integer,p_sealed text) returns void language sql security definer set search_path='' as $$
  update private.web_sessions set sealed_tokens=p_sealed,version=version+1 where token_hash=p_hash and version=p_version;
$$;

create function public.clear_server_session(p_hash text,p_all boolean) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
  select user_id into target from private.web_sessions where token_hash=p_hash;
  if target is null then return; end if;
  if p_all then delete from private.web_sessions where user_id=target;
  else delete from private.web_sessions where token_hash=p_hash; end if;
end;
$$;

revoke all on function public.put_server_session(text,uuid,uuid,text),public.get_server_session(text),public.rotate_server_session(text,integer,text),public.clear_server_session(text,boolean) from public,anon,authenticated;
grant execute on function public.put_server_session(text,uuid,uuid,text),public.get_server_session(text),public.rotate_server_session(text,integer,text),public.clear_server_session(text,boolean) to service_role;
notify pgrst,'reload schema';
