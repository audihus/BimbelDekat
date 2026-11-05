-- Siklus hidup akun guru (PRD FR13, FR15, FR17, ekspor) dan pembatalan sembunyi profil oleh pengelola.
-- Semua fungsi dapat dijalankan ulang (create or replace).

-- Permintaan penghapusan: profil langsung disembunyikan, tautan wali langsung dicabut, akses operasional tertutup
-- karena app_command/workspace_snapshot memakai require_user(false). Penghapusan nyata baru dijalankan setelah 7 hari.
create or replace function public.request_account_deletion() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare who uuid := private.require_user(false); space uuid;
begin
  if (select role from public.accounts where id = who) <> 'teacher' then raise exception 'Hanya akun guru yang dapat meminta penghapusan.'; end if;
  select id into space from public.workspaces where owner_id = who;
  -- Kunci yang sama dengan app_command: tidak ada perintah yang menyelinap saat status berubah.
  perform pg_advisory_xact_lock(hashtextextended(space::text, 0));
  update public.accounts set status = 'deletion_pending', deletion_requested_at = now() where id = who;
  update public.teacher_profiles set visible = false, updated_at = now() where workspace_id = space;
  update public.guardian_links set revoked_at = coalesce(revoked_at, now()) where workspace_id = space;
  insert into public.audit_events(workspace_id, actor_id, action) values (space, who, 'account.deletion_requested');
  return jsonb_build_object('purge_after', now() + interval '7 days');
end;
$$;

-- Pembatalan hanya selama masa 7 hari. Profil tetap tersembunyi dan tautan lama tetap dicabut.
create or replace function public.cancel_account_deletion() returns void
language plpgsql security definer set search_path = '' as $$
declare who uuid := private.require_user(true); space uuid; requested timestamptz;
begin
  select a.deletion_requested_at into requested from public.accounts a where a.id = who and a.status = 'deletion_pending';
  if requested is null then raise exception 'Tidak ada permintaan penghapusan yang dapat dibatalkan.'; end if;
  if requested <= now() - interval '7 days' then raise exception 'Masa pembatalan sudah berakhir.'; end if;
  select id into space from public.workspaces where owner_id = who;
  perform pg_advisory_xact_lock(hashtextextended(space::text, 0));
  update public.accounts set status = 'active', deletion_requested_at = null where id = who;
  insert into public.audit_events(workspace_id, actor_id, action) values (space, who, 'account.deletion_cancelled');
end;
$$;

-- Ekspor milik guru: hanya ruang kerjanya sendiri, termasuk seluruh riwayat perubahan (bukan 200 terakhir).
-- Boleh dipakai saat menunggu penghapusan (require_user(true)). token_hash tautan wali tidak pernah ikut.
create or replace function public.export_workspace() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare who uuid := private.require_user(true); space uuid; result jsonb;
begin
  select id into space from public.workspaces where owner_id = who;
  result := private.snapshot_for(space)
    || jsonb_build_object(
      'exported_at', now(),
      'account', (select jsonb_build_object('display_name', a.display_name, 'email', u.email, 'timezone', a.timezone, 'status', a.status, 'created_at', a.created_at)
                  from public.accounts a join auth.users u on u.id = a.id where a.id = who),
      'audit_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from public.audit_events e where e.workspace_id = space), '[]'::jsonb));
  insert into public.audit_events(workspace_id, actor_id, action) values (space, who, 'account.exported');
  return result;
end;
$$;

-- Jejak untuk aksi yang dikerjakan Supabase Auth (ganti email/kata sandi). Daftar putih, bukan teks bebas.
create or replace function public.record_account_event(p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare who uuid := private.require_user(true); space uuid;
begin
  if p_action not in ('account.email_change_requested', 'account.password_changed') then raise exception 'Peristiwa akun tidak dikenal.'; end if;
  select id into space from public.workspaces where owner_id = who;
  insert into public.audit_events(workspace_id, actor_id, action) values (space, who, p_action);
end;
$$;

-- Dijalankan terjadwal (belum dipasang di produksi) atau lewat scripts/process-deletions.mjs.
-- Menghapus auth.users lalu cascade ke akun, ruang kerja, seluruh catatan, dan sesi.
create or replace function public.process_account_deletions() returns integer
language plpgsql security definer set search_path = '' as $$
declare removed integer;
begin
  with doomed as (
    select a.id from public.accounts a
    where a.status = 'deletion_pending' and a.role = 'teacher' and a.deletion_requested_at <= now() - interval '7 days'
  ), gone as (
    delete from auth.users u using doomed d where u.id = d.id returning u.id
  )
  select count(*) into removed from gone;
  return removed;
end;
$$;

-- Moderasi: tambah 'unhide' agar keputusan sembunyi dapat dibatalkan (guru sendiri tidak bisa: profile.visibility menolaknya).
create or replace function public.moderate_profile(p_id uuid, p_decision text, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare space uuid;
begin
  if not private.is_admin() then raise exception 'Akses ditolak.' using errcode = '42501'; end if;
  select workspace_id into space from public.teacher_profiles where id = p_id;
  if not found then raise exception 'Profil tidak ditemukan.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(space::text, 0));
  if p_decision = 'approve' then
    if not exists(select 1 from public.teacher_profiles where id = p_id and review_status = 'pending') then raise exception 'Tidak ada pengajuan yang menunggu.'; end if;
    update public.teacher_profiles set published = draft, review_status = 'approved', visible = true, admin_hidden = false, review_reason = trim(p_reason), updated_at = now() where id = p_id;
  elsif p_decision in ('reject', 'hide', 'unhide') then
    if trim(coalesce(p_reason, '')) = '' then raise exception 'Tuliskan alasan moderasi.'; end if;
    if p_decision = 'reject' then update public.teacher_profiles set review_status = 'rejected', review_reason = trim(p_reason), updated_at = now() where id = p_id;
    elsif p_decision = 'hide' then update public.teacher_profiles set visible = false, admin_hidden = true, review_reason = trim(p_reason), updated_at = now() where id = p_id;
    else
      if not exists(select 1 from public.teacher_profiles where id = p_id and admin_hidden and published is not null) then raise exception 'Profil tidak sedang disembunyikan pengelola.'; end if;
      update public.teacher_profiles set visible = true, admin_hidden = false, review_reason = trim(p_reason), updated_at = now() where id = p_id;
    end if;
  else raise exception 'Keputusan tidak dikenal.'; end if;
  insert into public.audit_events(workspace_id, actor_id, action, entity_id, reason) values (space, auth.uid(), 'profile.' || p_decision, p_id, p_reason);
end;
$$;

revoke all on function public.request_account_deletion(), public.cancel_account_deletion(), public.export_workspace(), public.record_account_event(text) from public, anon;
grant execute on function public.request_account_deletion(), public.cancel_account_deletion(), public.export_workspace(), public.record_account_event(text) to authenticated;
revoke all on function public.process_account_deletions() from public, anon, authenticated;
grant execute on function public.process_account_deletions() to service_role;
notify pgrst, 'reload schema';
