'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { euro } from '@/lib/format';

/**
 * Gestion des investisseurs d'un tournoi (espace admin).
 * Permet de marquer un paiement comme reçu, ou de supprimer une participation.
 * - tournamentId : le tournoi concerné
 * - onChange     : appelé après chaque modification
 */
export default function AdminInvestors({ tournamentId, onChange }) {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('investors')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at');
    setInvestors(data || []);
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  // Bascule le statut payé / en attente
  async function togglePaid(inv) {
    setBusyId(inv.id);
    const { error } = await supabase
      .from('investors')
      .update({ paid: !inv.paid })
      .eq('id', inv.id);
    setBusyId(null);
    if (error) return alert("Erreur lors de la mise à jour.");
    await load();
    onChange?.();
  }

  // Supprime une participation (après confirmation)
  async function remove(inv) {
    const who = `${inv.first_name} ${inv.last_name || ''}`.trim();
    if (!confirm(`Supprimer la participation de ${who} (${euro(inv.amount)}) ?\n\nCette action est irréversible.`)) return;
    setBusyId(inv.id);
    const { error } = await supabase.from('investors').delete().eq('id', inv.id);
    setBusyId(null);
    if (error) return alert("Erreur lors de la suppression.");
    await load();
    onChange?.();
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (investors.length === 0) {
    return (
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center text-sm text-muted">
        Personne n'a encore participé à ce tournoi.
      </div>
    );
  }

  const total = investors.reduce((s, i) => s + Number(i.amount || 0), 0);
  const encaisse = investors.filter((i) => i.paid).reduce((s, i) => s + Number(i.amount || 0), 0);
  const attente = total - encaisse;
  const nbAttente = investors.filter((i) => !i.paid).length;

  return (
    <div className="space-y-4">
      {/* Récapitulatif */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-ink-800">
        <div className="bg-ink-900 px-4 py-3">
          <span className="stat-label">Engagé</span>
          <p className="mt-0.5 font-mono text-bone">{euro(total)}</p>
        </div>
        <div className="bg-ink-900 px-4 py-3">
          <span className="stat-label">Encaissé</span>
          <p className="mt-0.5 font-mono text-jade-400">{euro(encaisse)}</p>
        </div>
        <div className="bg-ink-900 px-4 py-3">
          <span className="stat-label">En attente</span>
          <p className={`mt-0.5 font-mono ${attente > 0 ? 'text-gold-300' : 'text-muted'}`}>{euro(attente)}</p>
        </div>
      </div>

      {nbAttente > 0 && (
        <p className="text-xs text-gold-300">
          {nbAttente} participation{nbAttente > 1 ? 's' : ''} en attente de règlement.
        </p>
      )}

      {/* Liste */}
      <ul className="divide-y divide-ink-800 overflow-hidden rounded-xl border border-ink-800">
        {investors.map((inv) => (
          <li
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-3 bg-ink-900 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-bone">
                {inv.first_name} {inv.last_name}
              </p>
              <p className="font-mono text-xs text-muted">{euro(inv.amount)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePaid(inv)}
                disabled={busyId === inv.id}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  inv.paid
                    ? 'border-jade-500 bg-jade-500/15 text-jade-400'
                    : 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                }`}
                title="Cliquer pour changer le statut"
              >
                {inv.paid ? '✔ Réglé' : '⏳ En attente'}
              </button>

              <button
                onClick={() => remove(inv)}
                disabled={busyId === inv.id}
                className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                title="Supprimer cette participation"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted">
        Astuce : clique sur « En attente » quand tu as reçu l'argent, le statut passe en « Réglé ».
      </p>
    </div>
  );
}
