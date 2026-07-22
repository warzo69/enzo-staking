'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { euro, amountSought } from '@/lib/format';

/**
 * Éditeur complet d'un tournoi pour l'admin.
 * - tournament : la ligne à éditer
 * - onChange   : appelé après enregistrement/suppression pour rafraîchir la liste
 */
export default function AdminTournamentEditor({ tournament, onChange }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('infos'); // infos | direct | resultat
  const [form, setForm] = useState({ ...tournament });
  const [liveMessage, setLiveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Met à jour un champ du formulaire
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Recalcule le montant recherché dès qu'on change buy-in ou % vendu
  const soughtPreview = amountSought(form.buy_in, form.percent_sold);

  // Enregistre les modifications dans la base
  async function save() {
    setSaving(true);
    const payload = {
      name: form.name,
      casino: form.casino,
      city: form.city,
      event_date: form.event_date || null,
      event_time: form.event_time,
      buy_in: num(form.buy_in),
      guaranteed_prizepool: num(form.guaranteed_prizepool),
      expected_players: int(form.expected_players),
      percent_sold: num(form.percent_sold),
      amount_sought: amountSought(form.buy_in, form.percent_sold),
      staking_open: !!form.staking_open,
      is_live: !!form.is_live,
      players_left: int(form.players_left),
      my_stack: int(form.my_stack),
      blinds: form.blinds,
      next_level: form.next_level,
      current_prize: numOrNull(form.current_prize),
      position: form.position,
      live_comment: form.live_comment,
      is_finished: !!form.is_finished,
      final_place: int(form.final_place),
      payout: numOrNull(form.payout),
      total_players: int(form.total_players),
      result_comment: form.result_comment,
    };
    const { error } = await supabase.from('tournaments').update(payload).eq('id', tournament.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onChange?.();
    } else {
      alert('Erreur lors de l\'enregistrement.');
    }
  }

  // Supprime le tournoi (après confirmation)
  async function remove() {
    if (!confirm(`Supprimer définitivement « ${tournament.name} » ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from('tournaments').delete().eq('id', tournament.id);
    if (!error) onChange?.();
    else alert('Erreur lors de la suppression.');
  }

  // Ajoute un message au fil du direct
  async function addLiveUpdate() {
    if (!liveMessage.trim()) return;
    const { error } = await supabase.from('live_updates').insert({
      tournament_id: tournament.id,
      message: liveMessage.trim(),
    });
    if (!error) { setLiveMessage(''); onChange?.(); }
  }

  return (
    <div className="card overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="font-display font-semibold text-bone">{tournament.name}</p>
          <p className="text-xs text-muted">
            {[tournament.casino, tournament.city].filter(Boolean).join(' · ')} · Buy-in {euro(tournament.buy_in)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tournament.is_live && <span className="chip border-red-500/40 text-red-400">direct</span>}
          {tournament.is_finished && <span className="chip">terminé</span>}
          <span className="text-muted">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-ink-800 p-5">
          {/* Onglets */}
          <div className="mb-5 flex gap-1 rounded-xl bg-ink-900 p-1">
            {[['infos', 'Infos & staking'], ['direct', 'Suivi direct'], ['resultat', 'Résultat']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === key ? 'bg-ink-700 text-jade-400' : 'text-muted hover:text-bone'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ---------------------------------------------------- Onglet INFOS */}
          {tab === 'infos' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du tournoi" full>
                <input className="field" value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Casino">
                <input className="field" value={form.casino || ''} onChange={(e) => set('casino', e.target.value)} />
              </Field>
              <Field label="Ville">
                <input className="field" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Date">
                <input type="date" className="field" value={form.event_date || ''} onChange={(e) => set('event_date', e.target.value)} />
              </Field>
              <Field label="Heure">
                <input className="field" value={form.event_time || ''} onChange={(e) => set('event_time', e.target.value)} placeholder="20:00" />
              </Field>
              <Field label="Buy-in (€)">
                <input className="field font-mono" value={form.buy_in ?? ''} onChange={(e) => set('buy_in', e.target.value)} />
              </Field>
              <Field label="Prizepool garanti (€)">
                <input className="field font-mono" value={form.guaranteed_prizepool ?? ''} onChange={(e) => set('guaranteed_prizepool', e.target.value)} />
              </Field>
              <Field label="Joueurs attendus">
                <input className="field font-mono" value={form.expected_players ?? ''} onChange={(e) => set('expected_players', e.target.value)} />
              </Field>
              <Field label="Pourcentage vendu (%)">
                <input className="field font-mono" value={form.percent_sold ?? ''} onChange={(e) => set('percent_sold', e.target.value)} />
              </Field>

              {/* Montant recherché, calculé automatiquement */}
              <div className="rounded-xl border border-jade-500/30 bg-jade-500/10 p-4">
                <span className="stat-label">Montant recherché (auto)</span>
                <p className="mt-1 font-mono text-lg font-semibold text-jade-400">{euro(soughtPreview)}</p>
              </div>

              {/* Ouvrir / fermer le financement */}
              <Field label="Financement" full>
                <div className="flex gap-2">
                  <Toggle active={!!form.staking_open} onClick={() => set('staking_open', true)} label="Ouvert" tone="jade" />
                  <Toggle active={!form.staking_open} onClick={() => set('staking_open', false)} label="Fermé" tone="muted" />
                </div>
              </Field>
            </div>
          )}

          {/* --------------------------------------------------- Onglet DIRECT */}
          {tab === 'direct' && (
            <div>
              <Field label="Tournoi en direct ?" full>
                <div className="flex gap-2">
                  <Toggle active={!!form.is_live} onClick={() => set('is_live', true)} label="● En direct" tone="red" />
                  <Toggle active={!form.is_live} onClick={() => set('is_live', false)} label="Hors ligne" tone="muted" />
                </div>
              </Field>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Joueurs restants">
                  <input className="field font-mono" value={form.players_left ?? ''} onChange={(e) => set('players_left', e.target.value)} />
                </Field>
                <Field label="Mon tapis (jetons)">
                  <input className="field font-mono" value={form.my_stack ?? ''} onChange={(e) => set('my_stack', e.target.value)} />
                </Field>
                <Field label="Blindes">
                  <input className="field font-mono" value={form.blinds || ''} onChange={(e) => set('blinds', e.target.value)} placeholder="500 / 1000" />
                </Field>
                <Field label="Prochain palier">
                  <input className="field font-mono" value={form.next_level || ''} onChange={(e) => set('next_level', e.target.value)} placeholder="600 / 1200" />
                </Field>
                <Field label="Gain actuel (€)">
                  <input className="field font-mono" value={form.current_prize ?? ''} onChange={(e) => set('current_prize', e.target.value)} />
                </Field>
                <Field label="Ma position">
                  <input className="field font-mono" value={form.position || ''} onChange={(e) => set('position', e.target.value)} placeholder="ITM, Table finale…" />
                </Field>
                <Field label="Commentaire épinglé" full>
                  <input className="field" value={form.live_comment || ''} onChange={(e) => set('live_comment', e.target.value)} placeholder="Break dîner, table agressive…" />
                </Field>
              </div>

              {/* Ajouter un message au fil */}
              <div className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4">
                <span className="stat-label">Ajouter au fil du direct</span>
                <div className="mt-2 flex gap-2">
                  <input
                    className="field"
                    value={liveMessage}
                    onChange={(e) => setLiveMessage(e.target.value)}
                    placeholder="ITM ! / Table finale / Bad beat…"
                    onKeyDown={(e) => e.key === 'Enter' && addLiveUpdate()}
                  />
                  <button onClick={addLiveUpdate} className="btn-ghost shrink-0">Publier</button>
                </div>
                <p className="mt-2 text-xs text-muted">Le message apparaît instantanément chez les visiteurs.</p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------- Onglet RÉSULTAT */}
          {tab === 'resultat' && (
            <div>
              <Field label="Tournoi terminé ?" full>
                <div className="flex gap-2">
                  <Toggle active={!!form.is_finished} onClick={() => { set('is_finished', true); set('is_live', false); }} label="Terminé" tone="gold" />
                  <Toggle active={!form.is_finished} onClick={() => set('is_finished', false)} label="En cours" tone="muted" />
                </div>
              </Field>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Place finale">
                  <input className="field font-mono" value={form.final_place ?? ''} onChange={(e) => set('final_place', e.target.value)} />
                </Field>
                <Field label="Nombre de joueurs">
                  <input className="field font-mono" value={form.total_players ?? ''} onChange={(e) => set('total_players', e.target.value)} />
                </Field>
                <Field label="Gain (€)">
                  <input className="field font-mono" value={form.payout ?? ''} onChange={(e) => set('payout', e.target.value)} />
                </Field>
                <Field label="Commentaire" full>
                  <input className="field" value={form.result_comment || ''} onChange={(e) => set('result_comment', e.target.value)} />
                </Field>
              </div>

              <p className="mt-3 text-xs text-muted">
                Profit, ROI et remboursements des investisseurs sont calculés automatiquement à l'enregistrement.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-800 pt-5">
            <button onClick={remove} className="btn-danger">Supprimer</button>
            <div className="flex items-center gap-3">
              {saved && <span className="text-sm text-jade-400">Enregistré ✔</span>}
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Petits composants d'aide ---
function Field({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, label, tone }) {
  const tones = {
    jade: 'border-jade-500 bg-jade-500/15 text-jade-400',
    red: 'border-red-500/50 bg-red-500/15 text-red-400',
    gold: 'border-gold-400/50 bg-gold-400/15 text-gold-300',
    muted: 'border-ink-600 bg-ink-700 text-bone',
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
        active ? tones[tone] : 'border-ink-700 bg-ink-900 text-muted'
      }`}
    >
      {label}
    </button>
  );
}

// Conversions sûres (chaîne -> nombre)
const num = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const numOrNull = (v) => (v === '' || v == null ? null : num(v));
const int = (v) => (v === '' || v == null ? null : parseInt(String(v).replace(/\s/g, ''), 10) || null);
