create or replace function public.app_command(p_action text, p_payload jsonb, p_request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := private.require_user(false);
  space uuid;
  entity uuid;
  result jsonb;
  fingerprint text := encode(extensions.digest(convert_to(p_payload::text,'utf8'),'sha256'),'hex');
  receipt private.command_receipts%rowtype;
  student public.students%rowtype;
  pack public.packages%rowtype;
  lesson public.lessons%rowtype;
  desired text;
  v_reason text := trim(coalesce(p_payload->>'reason',''));
  charge integer;
  old_charge integer;
  delta integer;
  balance integer;
  amount numeric(30,0);
begin
  select id into space from public.workspaces where owner_id=actor;
  if not private.can_access(space) then raise exception 'Ruang kerja tidak dapat diakses.' using errcode='42501'; end if;
  if p_request is null or p_payload is null then raise exception 'Identitas permintaan diperlukan.'; end if;
  -- Serialisasi per ruang kerja melindungi jatah, perubahan jadwal, dan retry bersamaan.
  perform pg_advisory_xact_lock(hashtextextended(space::text,0));
  select * into receipt from private.command_receipts where workspace_id=space and request_id=p_request;
  if found then
    if receipt.action<>p_action or receipt.payload_hash<>fingerprint then raise exception 'Permintaan yang sama tidak boleh memakai isi berbeda.'; end if;
    return receipt.result;
  end if;

  if p_action='student.create' then
    insert into public.students(workspace_id,name,level,guardian_phone,address,notes,source)
      values(space,trim(p_payload->>'name'),p_payload->>'level',coalesce(p_payload->>'guardian_phone',''),coalesce(p_payload->>'address',''),coalesce(p_payload->>'notes',''),coalesce(p_payload->>'source','unknown')) returning id into entity;
  elsif p_action in ('student.update','student.archive') then
    select * into student from public.students where id=(p_payload->>'id')::uuid and workspace_id=space;
    if not found then raise exception 'Murid tidak ditemukan.'; end if;
    entity:=student.id;
    if p_action='student.update' then
      update public.students set name=trim(p_payload->>'name'),level=p_payload->>'level',guardian_phone=coalesce(p_payload->>'guardian_phone',''),address=coalesce(p_payload->>'address',''),notes=coalesce(p_payload->>'notes','') where id=entity;
    else
      update public.students set archived=(p_payload->>'archived')::boolean where id=entity;
      if (p_payload->>'archived')::boolean then
        update public.lessons set status='cancelled',cancelled_by='teacher',reason='Murid diarsipkan; tanpa potong jatah' where workspace_id=space and student_id=entity and status='scheduled' and starts_at>now();
        update public.guardian_links set revoked_at=coalesce(revoked_at,now()) where workspace_id=space and student_id=entity;
      end if;
    end if;
  elsif p_action='package.create' then
    select * into student from public.students where id=(p_payload->>'student_id')::uuid and workspace_id=space and not archived;
    if not found then raise exception 'Pilih murid aktif milik Anda.'; end if;
    if coalesce(p_payload->>'agreed_price','') !~ '^[0-9]{1,30}$' then raise exception 'Harga harus berupa rupiah bulat.'; end if;
    insert into public.packages(workspace_id,student_id,name,quota,opening_used,agreed_price)
      values(space,student.id,trim(p_payload->>'name'),(p_payload->>'quota')::integer,coalesce((p_payload->>'opening_used')::integer,0),(p_payload->>'agreed_price')::numeric) returning id into entity;
  elsif p_action in ('package.close','package.adjust_quota','package.adjust_price') then
    select * into pack from public.packages where id=(p_payload->>'id')::uuid and workspace_id=space;
    if not found then raise exception 'Paket tidak ditemukan.'; end if;
    if v_reason='' then raise exception 'Tuliskan alasan perubahan.'; end if;
    entity:=pack.id;
    if p_action='package.close' then
      update public.packages set closed_at=coalesce(closed_at,now()),closure_reason=v_reason where id=entity;
    elsif p_action='package.adjust_quota' then
      delta:=(p_payload->>'delta')::integer;
      select remaining into balance from public.package_summaries where id=entity;
      if delta=0 or balance+delta<0 then raise exception 'Koreksi membuat jatah tidak sah.'; end if;
      insert into public.quota_events(workspace_id,package_id,delta,reason) values(space,entity,delta,v_reason);
    else
      if coalesce(p_payload->>'agreed_price','') !~ '^[0-9]{1,30}$' then raise exception 'Harga harus berupa rupiah bulat.'; end if;
      update public.packages set agreed_price=(p_payload->>'agreed_price')::numeric where id=entity;
    end if;
  elsif p_action='lesson.create' then
    select * into pack from public.packages where id=(p_payload->>'package_id')::uuid and workspace_id=space and closed_at is null;
    if not found then raise exception 'Pilih paket aktif milik Anda.'; end if;
    if not exists(select 1 from public.students where id=pack.student_id and not archived) then raise exception 'Murid sudah diarsipkan.'; end if;
    insert into public.lessons(workspace_id,package_id,student_id,starts_at,ends_at,mode)
      values(space,pack.id,pack.student_id,(p_payload->>'starts_at')::timestamptz,(p_payload->>'ends_at')::timestamptz,p_payload->>'mode') returning id into entity;
  elsif p_action in ('lesson.reschedule','lesson.finish','lesson.cancel','lesson.correct') then
    select * into lesson from public.lessons where id=(p_payload->>'id')::uuid and workspace_id=space;
    if not found then raise exception 'Jadwal tidak ditemukan.'; end if;
    entity:=lesson.id;
    select * into pack from public.packages where id=lesson.package_id and workspace_id=space;
    if p_action='lesson.reschedule' then
      if lesson.status<>'scheduled' then raise exception 'Hanya les terjadwal yang dapat dipindahkan.'; end if;
      if p_payload ? 'package_id' then
        select * into pack from public.packages where id=(p_payload->>'package_id')::uuid and student_id=lesson.student_id and workspace_id=space and closed_at is null;
        if not found then raise exception 'Pilih paket aktif murid yang sama.'; end if;
      end if;
      if not exists(select 1 from public.students where id=lesson.student_id and not archived) then raise exception 'Murid sudah diarsipkan.'; end if;
      update public.lessons set starts_at=(p_payload->>'starts_at')::timestamptz,ends_at=(p_payload->>'ends_at')::timestamptz,package_id=pack.id where id=entity;
    else
      desired:=case when p_action='lesson.finish' then 'completed' when p_action='lesson.cancel' and coalesce((p_payload->>'charged')::boolean,false) then 'cancelled_charged' when p_action='lesson.cancel' then 'cancelled' else p_payload->>'status' end;
      if desired not in ('scheduled','completed','cancelled','cancelled_charged') or desired is null then raise exception 'Status les tidak sah.'; end if;
      if p_action='lesson.correct' and v_reason='' then raise exception 'Tuliskan alasan koreksi les.'; end if;
      if p_action<>'lesson.correct' and lesson.status<>'scheduled' and lesson.status<>desired then raise exception 'Gunakan koreksi beralasan untuk mengubah hasil les.'; end if;
      if desired='cancelled_charged' and (v_reason='' or p_payload->>'cancelled_by'='teacher') then raise exception 'Potong jatah memerlukan alasan dan tidak berlaku jika guru membatalkan.'; end if;
      old_charge:=case when lesson.status in ('completed','cancelled_charged') then 1 else 0 end;
      charge:=case when desired in ('completed','cancelled_charged') then 1 else 0 end;
      delta:=old_charge-charge;
      if delta<0 then
        select remaining into balance from public.package_summaries where id=pack.id;
        if pack.closed_at is not null then raise exception 'Paket sudah ditutup.'; end if;
        if balance<1 then raise exception 'Jatah paket habis. Catat paket baru untuk les lanjutan.'; end if;
        if not exists(select 1 from public.students where id=lesson.student_id and not archived) then raise exception 'Murid sudah diarsipkan.'; end if;
      end if;
      if delta<>0 then
        insert into public.quota_events(workspace_id,package_id,lesson_id,delta,reason) values(space,pack.id,entity,delta,coalesce(nullif(v_reason,''),case when desired='completed' then 'Les selesai' else 'Koreksi hasil les' end));
      end if;
      update public.lessons set status=desired,reason=v_reason,cancelled_by=case when desired in ('cancelled','cancelled_charged') then coalesce(p_payload->>'cancelled_by','guardian') else null end where id=entity;
    end if;
  elsif p_action='payment.record' then
    select * into pack from public.packages where id=(p_payload->>'package_id')::uuid and workspace_id=space;
    if not found then raise exception 'Paket tidak ditemukan.'; end if;
    if coalesce(p_payload->>'amount','') !~ '^-?[0-9]{1,30}$' then raise exception 'Nominal harus berupa rupiah bulat.'; end if;
    amount:=(p_payload->>'amount')::numeric;
    desired:=p_payload->>'kind';
    if desired not in ('payment','refund','correction') or desired is null or amount=0 then raise exception 'Jenis atau nominal pembayaran tidak sah.'; end if;
    if desired in ('refund','correction') and v_reason='' then raise exception 'Tuliskan alasan pengembalian atau koreksi uang.'; end if;
    if desired='payment' and amount<0 then raise exception 'Nominal penerimaan harus positif.'; end if;
    if desired='refund' then amount:=-abs(amount); end if;
    insert into public.payments(workspace_id,package_id,amount,kind,reason,paid_at)
      values(space,pack.id,amount,desired,coalesce(nullif(v_reason,''),'Pembayaran manual'),coalesce(nullif(p_payload->>'paid_at','')::timestamptz,now())) returning id into entity;
  elsif p_action='guardian.create' then
    select * into student from public.students where id=(p_payload->>'student_id')::uuid and workspace_id=space and not archived;
    if not found then raise exception 'Pilih murid aktif milik Anda.'; end if;
    update public.guardian_links set revoked_at=now() where workspace_id=space and student_id=student.id and revoked_at is null;
    insert into public.guardian_links(workspace_id,student_id,token_hash) values(space,student.id,p_payload->>'token_hash') returning id into entity;
  elsif p_action='guardian.revoke' then
    update public.guardian_links set revoked_at=coalesce(revoked_at,now()) where id=(p_payload->>'id')::uuid and workspace_id=space returning id into entity;
    if entity is null then raise exception 'Tautan tidak ditemukan.'; end if;
  elsif p_action in ('profile.save','profile.submit') then
    if jsonb_typeof(p_payload->'document')<>'object' then raise exception 'Informasi profil tidak sah.'; end if;
    if p_action='profile.submit' and (length(trim(coalesce(p_payload->'document'->>'name','')))<2 or coalesce(p_payload->'document'->>'phone','')!~ '^[+0-9]{8,20}$' or jsonb_array_length(coalesce(p_payload->'document'->'offers','[]'))<1) then raise exception 'Lengkapi nama, kontak WhatsApp, dan penawaran les sebelum mengajukan.'; end if;
    insert into public.teacher_profiles(workspace_id,draft,review_status) values(space,p_payload->'document',case when p_action='profile.submit' then 'pending' else 'draft' end)
      on conflict(workspace_id) do update set draft=excluded.draft,review_status=excluded.review_status,updated_at=now() returning id into entity;
  elsif p_action='profile.accepting' then
    update public.teacher_profiles set accepting=(p_payload->>'accepting')::boolean,updated_at=now() where workspace_id=space returning id into entity;
    if entity is null then raise exception 'Buat profil terlebih dahulu.'; end if;
  elsif p_action='profile.visibility' then
    if (p_payload->>'visible')::boolean and not exists(select 1 from public.teacher_profiles where workspace_id=space and published is not null and not admin_hidden) then raise exception 'Profil harus disetujui pengelola terlebih dahulu.'; end if;
    update public.teacher_profiles set visible=(p_payload->>'visible')::boolean,updated_at=now() where workspace_id=space returning id into entity;
    if entity is null then raise exception 'Profil tidak ditemukan.'; end if;
  elsif p_action='account.timezone' then
    update public.accounts set timezone=p_payload->>'timezone' where id=actor;
    entity:=actor;
  else
    raise exception 'Tindakan tidak dikenal.';
  end if;

  result:=jsonb_build_object('id',entity);
  insert into public.audit_events(workspace_id,actor_id,action,entity_id,reason,details)
    values(space,actor,p_action,entity,v_reason,case when p_action='package.adjust_price' then jsonb_build_object('old_price',pack.agreed_price::text,'new_price',p_payload->>'agreed_price') else '{}'::jsonb end);
  insert into private.command_receipts(workspace_id,request_id,action,payload_hash,result) values(space,p_request,p_action,fingerprint,result);
  return result;
exception when exclusion_violation then raise exception 'Jadwal bertabrakan dengan les lain. Pilih waktu yang berbeda.';
end;
$$;

create or replace function public.guardian_summary(p_token text) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare link public.guardian_links%rowtype; result jsonb;
begin
  if length(p_token)<40 or length(p_token)>200 then return null; end if;
  select g.* into link from public.guardian_links g
    join public.students s on s.id=g.student_id and not s.archived
    join public.workspaces w on w.id=g.workspace_id join public.accounts a on a.id=w.owner_id and a.status='active'
    where g.token_hash=encode(extensions.digest(convert_to(p_token,'utf8'),'sha256'),'hex') and g.revoked_at is null and g.expires_at>now();
  if not found then return null; end if;
  select jsonb_build_object(
    'student',(select to_jsonb(s)-'workspace_id'-'source' from public.students s where s.id=link.student_id),
    'teacher',(select jsonb_build_object('name',a.display_name,'timezone',a.timezone) from public.workspaces w join public.accounts a on a.id=w.owner_id where w.id=link.workspace_id),
    'packages',coalesce((select jsonb_agg(to_jsonb(p)-'workspace_id'||jsonb_build_object('agreed_price',p.agreed_price::text)) from public.package_summaries p where p.student_id=link.student_id and p.workspace_id=link.workspace_id),'[]'::jsonb),
    'lessons',coalesce((select jsonb_agg(to_jsonb(l)-'workspace_id' order by l.starts_at) from public.lessons l where l.student_id=link.student_id and l.workspace_id=link.workspace_id),'[]'::jsonb),
    'payments',coalesce((select jsonb_agg(to_jsonb(p)-'workspace_id'||jsonb_build_object('amount',p.amount::text)) from public.payments p join public.packages k on k.id=p.package_id where k.student_id=link.student_id and p.workspace_id=link.workspace_id),'[]'::jsonb),
    'expires_at',link.expires_at
  ) into result;
  return result;
end;
$$;

create or replace function public.public_teachers() returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'document',p.published,'accepting',p.accepting) order by p.id),'[]'::jsonb)
  from public.teacher_profiles p join public.workspaces w on w.id=p.workspace_id join public.accounts a on a.id=w.owner_id
  where p.visible and not p.admin_hidden and p.published is not null and a.status='active';
$$;

create or replace function public.review_queue() returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Hanya pengelola yang dapat membuka pemeriksaan profil.' using errcode='42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(p) order by p.updated_at) from public.teacher_profiles p),'[]'::jsonb);
end;
$$;

create or replace function public.moderate_profile(p_id uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path = '' as $$
declare space uuid;
begin
  if not private.is_admin() then raise exception 'Akses ditolak.' using errcode='42501'; end if;
  select workspace_id into space from public.teacher_profiles where id=p_id;
  if not found then raise exception 'Profil tidak ditemukan.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(space::text,0));
  if p_decision='approve' then
    if not exists(select 1 from public.teacher_profiles where id=p_id and review_status='pending') then raise exception 'Tidak ada pengajuan yang menunggu.'; end if;
    update public.teacher_profiles set published=draft,review_status='approved',visible=true,admin_hidden=false,review_reason=trim(p_reason),updated_at=now() where id=p_id;
  elsif p_decision in ('reject','hide') then
    if trim(coalesce(p_reason,''))='' then raise exception 'Tuliskan alasan moderasi.'; end if;
    if p_decision='reject' then update public.teacher_profiles set review_status='rejected',review_reason=trim(p_reason),updated_at=now() where id=p_id;
    else update public.teacher_profiles set visible=false,admin_hidden=true,review_reason=trim(p_reason),updated_at=now() where id=p_id; end if;
  else raise exception 'Keputusan tidak dikenal.'; end if;
  insert into public.audit_events(workspace_id,actor_id,action,entity_id,reason) values(space,auth.uid(),'profile.'||p_decision,p_id,p_reason);
end;
$$;

revoke all on function public.app_command(text,jsonb,uuid),public.guardian_summary(text),public.public_teachers(),public.review_queue(),public.moderate_profile(uuid,text,text) from public;
grant execute on function public.app_command(text,jsonb,uuid),public.review_queue(),public.moderate_profile(uuid,text,text) to authenticated;
grant execute on function public.guardian_summary(text),public.public_teachers() to anon,authenticated;
