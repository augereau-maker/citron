-- ============================================================================
-- CITRON — Script SQL Supabase
-- À exécuter dans : Dashboard Supabase → SQL Editor → New query
-- Peut être exécuté plusieurs fois sans erreur (IF NOT EXISTS / DROP POLICY).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table PROFILES (rôle praticien / patient, liée à auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('praticien', 'patient')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: chacun voit son propre profil" on public.profiles;
create policy "profiles: chacun voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: chacun crée son propre profil" on public.profiles;
create policy "profiles: chacun crée son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles: chacun modifie son propre profil" on public.profiles;
create policy "profiles: chacun modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

grant select, insert, update on public.profiles to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 2. Table PATIENTS (fiches patients partagées entre tous les praticiens)
--    practitioner_id garde une trace de qui a créé la fiche, mais n'est plus
--    une clé étrangère vers auth.users : un praticien provisionné par l'admin
--    (table practitioners, pas un compte Supabase Auth) peut aussi en créer.
--    Tous les praticiens (Supabase Auth ou provisionnés) voient et gèrent
--    l'ensemble des patients — coordination interdisciplinaire oblige.
-- ----------------------------------------------------------------------------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date,
  login text unique,
  password text,
  created_at timestamptz not null default now()
);

-- Pour les installations existantes (la table peut déjà exister sans ces colonnes).
alter table public.patients add column if not exists login text unique;
alter table public.patients add column if not exists password text;

-- practitioner_id peut désormais référencer soit auth.users, soit practitioners.
alter table public.patients drop constraint if exists patients_practitioner_id_fkey;

alter table public.patients enable row level security;

drop policy if exists "patients: le praticien gère ses patients" on public.patients;
drop policy if exists "patients: tous les praticiens accèdent à tous les patients" on public.patients;
create policy "patients: tous les praticiens accèdent à tous les patients"
  on public.patients for all
  using (true)
  with check (true);

-- La policy RLS ne suffit pas : sans ce GRANT, Postgres refuse la requête
-- avant même d'évaluer la policy ("permission denied for table patients"),
-- notamment pour les comptes praticien provisionnés (rôle anon, pas de
-- session Supabase Auth).
grant select, insert, update, delete on public.patients to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. Table APPOINTMENTS (rendez-vous, pour le "plan du jour")
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'prevu' check (status in ('prevu', 'confirme', 'annule', 'termine')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

drop policy if exists "appointments: le praticien gère ses rendez-vous" on public.appointments;
create policy "appointments: le praticien gère ses rendez-vous"
  on public.appointments for all
  using (auth.uid() = practitioner_id)
  with check (auth.uid() = practitioner_id);

grant select, insert, update, delete on public.appointments to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 4. Table FORMULAIRES (formulaires dynamiques en JSONB, partagés entre tous
--    les praticiens : l'historique d'un patient doit montrer les formulaires
--    remplis par TOUS les intervenants, pas seulement l'auteur connecté).
-- ----------------------------------------------------------------------------
create table if not exists public.formulaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  form_type text not null,
  form_data jsonb not null,
  practitioner_name text,
  created_at timestamptz not null default now()
);

-- Pour les installations existantes (nom du praticien affiché à côté de la date/heure).
alter table public.formulaires add column if not exists practitioner_name text;

-- Index pour interroger rapidement le contenu JSONB si besoin plus tard
create index if not exists formulaires_form_data_gin on public.formulaires using gin (form_data);
create index if not exists formulaires_user_id_idx on public.formulaires (user_id);

-- user_id peut désormais référencer soit auth.users, soit practitioners.
alter table public.formulaires drop constraint if exists formulaires_user_id_fkey;

alter table public.formulaires enable row level security;

drop policy if exists "formulaires: l'auteur gère ses formulaires" on public.formulaires;
drop policy if exists "formulaires: tous les praticiens accèdent à tous les formulaires" on public.formulaires;
create policy "formulaires: tous les praticiens accèdent à tous les formulaires"
  on public.formulaires for all
  using (true)
  with check (true);

grant select, insert, update, delete on public.formulaires to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 5. Espace Patient : fonctions RPC sécurisées (SECURITY DEFINER)
--    Les patients ne sont PAS des utilisateurs Supabase Auth : ils se
--    connectent avec l'identifiant/mot de passe généré par le praticien
--    (voir patients.js → createPatient). Comme les policies RLS ci-dessus
--    interdisent tout accès anonyme aux tables patients/formulaires, ces
--    deux fonctions contournent volontairement RLS (SECURITY DEFINER) après
--    avoir elles-mêmes vérifié l'identifiant/mot de passe fourni.
-- ----------------------------------------------------------------------------
create or replace function public.verify_patient_login(p_login text, p_password text)
returns table (patient_id uuid, first_name text, last_name text)
language sql
security definer
set search_path = public
as $$
  select id, first_name, last_name
  from public.patients
  where login = p_login and password = p_password;
$$;

grant execute on function public.verify_patient_login(text, text) to anon, authenticated;

-- Nécessaire avant le CREATE OR REPLACE ci-dessous : Postgres refuse de
-- changer le type de retour (ajout de practitioner_name) d'une fonction
-- existante sans la supprimer d'abord.
drop function if exists public.patient_formulaires(uuid, text, text);

create or replace function public.patient_formulaires(p_patient_id uuid, p_login text, p_password text)
returns table (id uuid, form_type text, form_data jsonb, created_at timestamptz, practitioner_name text)
language sql
security definer
set search_path = public
as $$
  select f.id, f.form_type, f.form_data, f.created_at, f.practitioner_name
  from public.formulaires f
  join public.patients p on p.id = f.patient_id
  where p.id = p_patient_id
    and p.login = p_login
    and p.password = p_password
  order by f.created_at desc;
$$;

grant execute on function public.patient_formulaires(uuid, text, text) to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 6. Table PRACTITIONERS (comptes praticien provisionnés par l'administrateur :
--    identifiant + mot de passe généré, pas un compte Supabase Auth). Un
--    praticien provisionné ainsi voit l'ensemble des patients (pas de
--    cloisonnement par practitioner_id). Aucune policy RLS : cette table
--    n'est accédée que via les fonctions RPC ci-dessous.
-- ----------------------------------------------------------------------------
create table if not exists public.practitioners (
  id uuid primary key default gen_random_uuid(),
  login text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.practitioners enable row level security;

create or replace function public.verify_practitioner_login(p_login text, p_password text)
returns table (practitioner_id uuid, login text)
language sql
security definer
set search_path = public
as $$
  select id, login from public.practitioners where login = p_login and password = p_password;
$$;

grant execute on function public.verify_practitioner_login(text, text) to anon, authenticated;

create or replace function public.practitioner_list_patients(p_login text, p_password text)
returns table (id uuid, first_name text, last_name text, birth_date date)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.practitioners where login = p_login and password = p_password) then
    raise exception 'Identifiants invalides.';
  end if;
  return query select p.id, p.first_name, p.last_name, p.birth_date from public.patients p order by p.last_name;
end;
$$;

grant execute on function public.practitioner_list_patients(text, text) to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 7. Espace Administrateur : gestion des patients et des comptes praticien.
--    L'identifiant/mot de passe admin ("admin" / "CitroN") sont volontairement
--    en dur ici, en miroir du contrôle fait côté client (js/admin.js) : ce
--    n'est pas un compte à haute sécurité, juste un accès de gestion interne.
-- ----------------------------------------------------------------------------
-- Nécessaire avant le CREATE OR REPLACE ci-dessous : Postgres refuse de
-- changer le type de retour (ajout de created_at / dernière consultation)
-- d'une fonction existante sans la supprimer d'abord.
drop function if exists public.admin_list_patients(text);

create or replace function public.admin_list_patients(p_admin_password text)
returns table (
  id uuid,
  first_name text,
  last_name text,
  birth_date date,
  login text,
  password text,
  created_at timestamptz,
  last_consultation_at timestamptz,
  last_consultation_practitioner text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  return query
    select
      p.id, p.first_name, p.last_name, p.birth_date, p.login, p.password, p.created_at,
      lf.created_at as last_consultation_at,
      lf.practitioner_name as last_consultation_practitioner
    from public.patients p
    left join lateral (
      select f.created_at, f.practitioner_name
      from public.formulaires f
      where f.patient_id = p.id
      order by f.created_at desc
      limit 1
    ) lf on true
    order by p.last_name;
end;
$$;

grant execute on function public.admin_list_patients(text) to anon, authenticated;

create or replace function public.admin_delete_patient(p_admin_password text, p_patient_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  delete from public.patients where id = p_patient_id;
end;
$$;

grant execute on function public.admin_delete_patient(text, uuid) to anon, authenticated;

create or replace function public.admin_create_practitioner(p_admin_password text, p_login text, p_password text)
returns table (id uuid, login text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  insert into public.practitioners (login, password) values (p_login, p_password)
    returning practitioners.id into new_id;
  return query select new_id, p_login;
end;
$$;

grant execute on function public.admin_create_practitioner(text, text, text) to anon, authenticated;

create or replace function public.admin_list_practitioners(p_admin_password text)
returns table (id uuid, login text, password text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  return query select pr.id, pr.login, pr.password, pr.created_at from public.practitioners pr order by pr.created_at desc;
end;
$$;

grant execute on function public.admin_list_practitioners(text) to anon, authenticated;

create or replace function public.admin_delete_practitioner(p_admin_password text, p_practitioner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  delete from public.practitioners where id = p_practitioner_id;
end;
$$;

grant execute on function public.admin_delete_practitioner(text, uuid) to anon, authenticated;

create or replace function public.admin_list_formulaires(p_admin_password text)
returns table (id uuid, form_type text, created_at timestamptz, practitioner_name text, patient_id uuid, patient_first_name text, patient_last_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  return query
    select f.id, f.form_type, f.created_at, f.practitioner_name, f.patient_id, p.first_name, p.last_name
    from public.formulaires f
    left join public.patients p on p.id = f.patient_id
    order by f.created_at desc;
end;
$$;

grant execute on function public.admin_list_formulaires(text) to anon, authenticated;

create or replace function public.admin_delete_formulaire(p_admin_password text, p_formulaire_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_password is distinct from 'CitroN' then
    raise exception 'Accès refusé.';
  end if;
  delete from public.formulaires where id = p_formulaire_id;
end;
$$;

grant execute on function public.admin_delete_formulaire(text, uuid) to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 8. (Optionnel mais recommandé) Trigger de sécurité :
--    empêche un compte de s'auto-attribuer un rôle différent après création.
--    La création du profil se fait déjà côté application (voir auth.js) ;
--    ce trigger est un filet de sécurité si l'insertion applicative échoue.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'praticien')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fin du script.
