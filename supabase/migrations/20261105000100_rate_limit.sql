-- Pembatas percobaan (login, pemulihan, aksi sensitif). Disimpan di Postgres agar berlaku di serverless
-- tanpa memori proses. Kunci sudah di-HMAC oleh aplikasi sehingga email/IP tidak tersimpan mentah.
create table if not exists private.rate_events (
  bucket text not null check (bucket ~ '^[a-z0-9._:-]{1,60}$'),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  at timestamptz not null default now()
);
create index if not exists rate_events_lookup on private.rate_events(bucket, key_hash, at);
alter table private.rate_events enable row level security;
revoke all on private.rate_events from public, anon, authenticated;

-- p_record=false hanya memeriksa (dipakai login: yang dihitung hanya percobaan gagal, dicatat terpisah).
create or replace function public.rate_check(p_bucket text, p_key_hash text, p_limit integer, p_window_seconds integer, p_record boolean default true)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare used integer; oldest timestamptz; retry integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or p_bucket !~ '^[a-z0-9._:-]{1,60}$' or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Parameter pembatas tidak sah.';
  end if;
  -- Serialisasi per kunci: dua permintaan serempak tidak bisa sama-sama lolos di batas.
  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key_hash, 0));
  delete from private.rate_events where bucket = p_bucket and key_hash = p_key_hash and at <= now() - make_interval(secs => p_window_seconds);
  -- Pembersihan sesekali agar tabel tidak tumbuh tanpa batas oleh kunci yang tidak pernah muncul lagi.
  if random() < 0.01 then delete from private.rate_events where at < now() - interval '1 day'; end if;
  select count(*), min(at) into used, oldest from private.rate_events where bucket = p_bucket and key_hash = p_key_hash;
  if used >= p_limit then
    retry := greatest(1, ceil(extract(epoch from (oldest + make_interval(secs => p_window_seconds) - now())))::integer);
    return jsonb_build_object('allowed', false, 'retry_after', retry);
  end if;
  if p_record then insert into private.rate_events(bucket, key_hash) values (p_bucket, p_key_hash); end if;
  return jsonb_build_object('allowed', true, 'retry_after', 0);
end;
$$;

revoke all on function public.rate_check(text, text, integer, integer, boolean) from public, anon, authenticated;
grant execute on function public.rate_check(text, text, integer, integer, boolean) to service_role;
notify pgrst, 'reload schema';
