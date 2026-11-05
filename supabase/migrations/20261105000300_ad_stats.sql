-- Penghitung ringan kinerja iklan: berapa kali profil dilihat dan tombol WhatsApp ditekan, per hari.
-- Sengaja hanya angka: tidak menyimpan IP, perangkat, atau identitas pengunjung. Angka bersifat perkiraan.
create table if not exists public.ad_stats (
  profile_id uuid not null references public.teacher_profiles(id) on delete cascade,
  day date not null,
  views integer not null default 0 check (views >= 0),
  wa_clicks integer not null default 0 check (wa_clicks >= 0),
  primary key (profile_id, day)
);
alter table public.ad_stats enable row level security;
revoke all on public.ad_stats from public, anon, authenticated;

-- Hanya dipanggil server (service_role) setelah pembatas per-IP. Profil yang tidak tayang diabaikan diam-diam,
-- sehingga tebak-tebakan ID tidak mengungkap profil mana yang ada.
create or replace function public.record_ad_event(p_profile uuid, p_kind text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_kind not in ('view', 'wa_click') then raise exception 'Jenis peristiwa tidak sah.'; end if;
  if not exists (select 1 from public.teacher_profiles where id = p_profile and published is not null and visible and not admin_hidden) then return; end if;
  insert into public.ad_stats as s (profile_id, day, views, wa_clicks)
    values (p_profile, (now() at time zone 'Asia/Jakarta')::date, case when p_kind = 'view' then 1 else 0 end, case when p_kind = 'wa_click' then 1 else 0 end)
    on conflict (profile_id, day) do update set
      views = s.views + case when p_kind = 'view' then 1 else 0 end,
      wa_clicks = s.wa_clicks + case when p_kind = 'wa_click' then 1 else 0 end;
end;
$$;

-- Hanya angka milik pemanggil sendiri: profil dicari lewat ruang kerja pemilik sesi, bukan dari parameter.
create or replace function public.ad_stats_summary() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare who uuid := private.require_user(false); pid uuid; today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  select p.id into pid from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = who;
  return jsonb_build_object(
    'last7', (select jsonb_build_object('views', coalesce(sum(views), 0), 'wa_clicks', coalesce(sum(wa_clicks), 0)) from public.ad_stats where profile_id = pid and day > today - 7),
    'last30', (select jsonb_build_object('views', coalesce(sum(views), 0), 'wa_clicks', coalesce(sum(wa_clicks), 0)) from public.ad_stats where profile_id = pid and day > today - 30),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('day', g.d, 'views', coalesce(s.views, 0), 'wa_clicks', coalesce(s.wa_clicks, 0)) order by g.d), '[]'::jsonb)
             from generate_series(today - 6, today, interval '1 day') as g(d) left join public.ad_stats s on s.profile_id = pid and s.day = g.d::date));
end;
$$;

revoke all on function public.record_ad_event(uuid, text) from public, anon, authenticated;
grant execute on function public.record_ad_event(uuid, text) to service_role;
revoke all on function public.ad_stats_summary() from public, anon;
grant execute on function public.ad_stats_summary() to authenticated;
notify pgrst, 'reload schema';
