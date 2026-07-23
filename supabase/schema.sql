-- ===========================================================================
--  BASE DE DONNÉES — Site de staking poker d'Enzo Nourry
--  Copie/colle TOUT ce fichier dans Supabase > SQL Editor > Run (voir guide).
-- ===========================================================================

-- Extension pour générer des identifiants uniques
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1) PROFIL  (une seule ligne : ta présentation affichée sur l'accueil)
-- ---------------------------------------------------------------------------
create table if not exists profile (
  id          int primary key default 1,
  full_name   text        not null default 'Enzo Nourry',
  pseudo      text        not null default 'MonPseudo',
  photo_url   text        default '',
  bio         text        default 'Joueur de poker en tournois live.',
  payment_info text       default '',
  updated_at  timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);

-- On insère la ligne unique du profil si elle n'existe pas encore.
insert into profile (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) TOURNOIS
-- ---------------------------------------------------------------------------
create table if not exists tournaments (
  id                    uuid primary key default gen_random_uuid(),
  -- Infos générales
  name                  text        not null,
  casino                text        default '',
  city                  text        default '',
  event_date            date,
  event_time            text        default '',
  buy_in                numeric     not null default 0,
  guaranteed_prizepool  numeric     default 0,
  expected_players      int         default 0,
  -- Staking
  percent_sold          numeric     not null default 0,   -- ex : 50 (%)
  amount_sought         numeric     not null default 0,    -- calculé : buy_in × %/100
  staking_open          boolean     not null default true, -- ouvert / fermé aux investisseurs
  -- Suivi en direct (fonctionnalité 7)
  is_live               boolean     not null default false,
  players_left          int,
  my_stack              bigint,
  blinds                text        default '',
  next_level            text        default '',
  current_prize         numeric,
  position              text        default '',
  live_comment          text        default '',
  -- Résultat final (fonctionnalité 8)
  is_finished           boolean     not null default false,
  final_place           int,
  payout                numeric,
  total_players         int,
  result_comment        text        default '',
  -- Divers
  created_at            timestamptz not null default now()
);

create index if not exists tournaments_created_idx on tournaments (created_at desc);

-- ---------------------------------------------------------------------------
-- 3) INVESTISSEURS  (les personnes qui financent un tournoi)
-- ---------------------------------------------------------------------------
create table if not exists investors (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references tournaments (id) on delete cascade,
  first_name     text not null,
  last_name      text default '',
  amount         numeric not null default 0,
  paid           boolean not null default false,   -- réglé ou en attente
  created_at     timestamptz not null default now()
);

create index if not exists investors_tournament_idx on investors (tournament_id);

-- ---------------------------------------------------------------------------
-- 4) MISES À JOUR EN DIRECT  (le fil "Break dîner", "ITM !", "Table finale"…)
-- ---------------------------------------------------------------------------
create table if not exists live_updates (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references tournaments (id) on delete cascade,
  message        text not null,
  created_at     timestamptz not null default now()
);

create index if not exists live_updates_tournament_idx on live_updates (tournament_id, created_at desc);

-- ===========================================================================
--  SÉCURITÉ (Row Level Security)
--  Règle : tout le monde peut LIRE. Seul toi (connecté) peux MODIFIER.
--  Exception : les visiteurs peuvent AJOUTER un investissement.
-- ===========================================================================

alter table profile      enable row level security;
alter table tournaments  enable row level security;
alter table investors    enable row level security;
alter table live_updates enable row level security;

-- PROFIL : lecture publique, modification réservée à l'admin connecté
drop policy if exists "profile lecture publique" on profile;
create policy "profile lecture publique" on profile
  for select using (true);
drop policy if exists "profile modif admin" on profile;
create policy "profile modif admin" on profile
  for update using (auth.role() = 'authenticated');

-- TOURNOIS : lecture publique, écriture réservée à l'admin
drop policy if exists "tournois lecture publique" on tournaments;
create policy "tournois lecture publique" on tournaments
  for select using (true);
drop policy if exists "tournois ecriture admin" on tournaments;
create policy "tournois ecriture admin" on tournaments
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- INVESTISSEURS : lecture publique, ajout public, suppression/modif admin
drop policy if exists "investisseurs lecture publique" on investors;
create policy "investisseurs lecture publique" on investors
  for select using (true);
drop policy if exists "investisseurs ajout public" on investors;
create policy "investisseurs ajout public" on investors
  for insert with check (true);
drop policy if exists "investisseurs modif admin" on investors;
create policy "investisseurs modif admin" on investors
  for update using (auth.role() = 'authenticated');
drop policy if exists "investisseurs suppr admin" on investors;
create policy "investisseurs suppr admin" on investors
  for delete using (auth.role() = 'authenticated');

-- MISES À JOUR EN DIRECT : lecture publique, écriture admin
drop policy if exists "live lecture publique" on live_updates;
create policy "live lecture publique" on live_updates
  for select using (true);
drop policy if exists "live ecriture admin" on live_updates;
create policy "live ecriture admin" on live_updates
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ===========================================================================
--  TEMPS RÉEL : on active la diffusion des changements pour ces tables,
--  afin que les visiteurs voient les mises à jour sans recharger la page.
-- ===========================================================================
alter publication supabase_realtime add table tournaments;
alter publication supabase_realtime add table investors;
alter publication supabase_realtime add table live_updates;
