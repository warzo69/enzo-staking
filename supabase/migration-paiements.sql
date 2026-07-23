-- ===========================================================================
--  MISE À JOUR — Suivi des paiements + infos de règlement
--  À copier/coller dans Supabase > SQL Editor > Run (UNE SEULE FOIS).
--  Sans danger : ne supprime rien, ajoute seulement ce qui manque.
-- ===========================================================================

-- 1) Chaque investisseur a maintenant un statut "payé / en attente"
alter table investors
  add column if not exists paid boolean not null default false;

-- 2) Le profil peut contenir les instructions de paiement (IBAN, Lydia…)
alter table profile
  add column if not exists payment_info text default '';

-- ===========================================================================
--  Fin. Tu dois voir « Success. No rows returned ».
-- ===========================================================================
