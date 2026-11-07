-- Foto profil guru. Berkasnya JPEG kecil yang sudah dibersihkan server (src/lib/jpeg.ts), disimpan di basis data
-- (tanpa Storage, supaya jalan sama persis di lokal dan produksi). Dokumen profil hanya menyimpan ID foto, jadi foto
-- ikut alur biasa: draf -> dikirim -> ditinjau pengelola -> tayang. Foto yang belum disetujui tidak pernah tampil di publik.
create table if not exists private.profile_photos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  data bytea not null check (octet_length(data) between 100 and 150000),
  created_at timestamptz not null default now()
);
create index if not exists profile_photos_workspace on private.profile_photos(workspace_id);
alter table private.profile_photos enable row level security;
revoke all on private.profile_photos from public, anon, authenticated;

-- Dokumen profil boleh menunjuk hanya foto milik ruang kerjanya sendiri, apa pun jalur penulisnya.
create or replace function private.check_profile_photo() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.draft ? 'photo' then
    if jsonb_typeof(new.draft->'photo') <> 'string' or new.draft->>'photo' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Foto profil tidak sah.';
    end if;
    if not exists (select 1 from private.profile_photos f where f.id = (new.draft->>'photo')::uuid and f.workspace_id = new.workspace_id) then
      raise exception 'Foto profil tidak ditemukan. Unggah ulang fotonya.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists teacher_profiles_check_photo on public.teacher_profiles;
create trigger teacher_profiles_check_photo before insert or update of draft on public.teacher_profiles
  for each row execute function private.check_profile_photo();

-- Mengunggah foto (base64 dari server, sudah diperiksa). Foto baru belum tampil di mana pun sampai disimpan ke draf,
-- dikirim, lalu disetujui. Foto lama yang tidak dipakai draf maupun profil tayang dibersihkan setelah sehari.
create or replace function public.save_profile_photo(p_data text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare who uuid := private.require_user(false); space uuid; raw bytea; pid uuid;
begin
  if (select role from public.accounts where id = who) <> 'teacher' then raise exception 'Hanya akun guru yang dapat mengunggah foto.'; end if;
  select id into space from public.workspaces where owner_id = who;
  perform pg_advisory_xact_lock(hashtextextended(space::text, 0));
  begin raw := decode(p_data, 'base64'); exception when others then raise exception 'Foto tidak dapat dibaca.'; end;
  if octet_length(raw) not between 100 and 150000 then raise exception 'Ukuran foto tidak sesuai.'; end if;
  delete from private.profile_photos f
    where f.workspace_id = space and f.created_at < now() - interval '1 day'
      and f.id::text is distinct from (select t.draft->>'photo' from public.teacher_profiles t where t.workspace_id = space)
      and f.id::text is distinct from (select t.published->>'photo' from public.teacher_profiles t where t.workspace_id = space);
  if (select count(*) from private.profile_photos where workspace_id = space) >= 10 then raise exception 'Terlalu banyak foto yang diunggah. Coba lagi besok.'; end if;
  insert into private.profile_photos(workspace_id, data) values (space, raw) returning id into pid;
  insert into public.audit_events(workspace_id, actor_id, action, entity_id) values (space, who, 'profile.photo_uploaded', pid);
  return pid;
end;
$$;

-- Foto untuk umum: hanya yang dipakai profil TAYANG milik akun aktif. Selain itu hasilnya kosong (sama seperti foto yang tidak ada).
create or replace function public.public_profile_photo(p_id uuid) returns text
language sql stable security definer set search_path = '' as $$
  select encode(f.data, 'base64') from private.profile_photos f
  where f.id = p_id and exists (
    select 1 from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id join public.accounts a on a.id = w.owner_id
    where p.workspace_id = f.workspace_id and p.published->>'photo' = f.id::text and p.visible and not p.admin_hidden and a.status = 'active');
$$;

-- Foto untuk pemiliknya (pratinjau draf) dan untuk pengelola yang meninjau profil yang memakainya.
create or replace function public.private_profile_photo(p_id uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
declare who uuid := private.require_user(true);
begin
  return (select encode(f.data, 'base64') from private.profile_photos f
    where f.id = p_id and (
      f.workspace_id = (select w.id from public.workspaces w where w.owner_id = who)
      or (private.is_admin() and exists (select 1 from public.teacher_profiles p where p.workspace_id = f.workspace_id and (p.draft->>'photo' = f.id::text or p.published->>'photo' = f.id::text)))));
end;
$$;

revoke all on function public.save_profile_photo(text), public.public_profile_photo(uuid), public.private_profile_photo(uuid) from public, anon, authenticated;
grant execute on function public.save_profile_photo(text), public.private_profile_photo(uuid) to authenticated;
grant execute on function public.public_profile_photo(uuid) to anon, authenticated;
notify pgrst, 'reload schema';
