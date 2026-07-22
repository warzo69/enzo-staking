'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { euro, percent, investorShareOfSold } from '@/lib/format';

/**
 * Formulaire pour qu'un visiteur participe au financement.
 * - tournamentId : le tournoi concerné
 * - sought       : montant recherché (pour calculer la part)
 * - remaining    : montant restant à collecter
 * - onDone       : appelé après un ajout réussi (pour rafraîchir la liste)
 */
export default function StakingForm({ tournamentId, sought = 0, remaining = 0, onDone }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Aperçu en direct : quel pourcentage cet investissement représente
  const previewShare = amount ? investorShareOfSold(amount, sought) : 0;

  async function handleSubmit() {
    setError('');
    const value = parseFloat(String(amount).replace(',', '.'));

    // Vérifications simples
    if (!firstName.trim()) return setError('Indiquez votre prénom.');
    if (!value || value <= 0) return setError('Indiquez un montant valide.');
    if (value > remaining + 0.01) {
      return setError(`Il ne reste que ${euro(remaining)} à financer.`);
    }

    setLoading(true);
    const { error: dbError } = await supabase.from('investors').insert({
      tournament_id: tournamentId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      amount: value,
    });
    setLoading(false);

    if (dbError) {
      setError("Une erreur est survenue. Réessayez dans un instant.");
      return;
    }

    // Réinitialise le formulaire et prévient la page parente
    setFirstName('');
    setLastName('');
    setAmount('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
    onDone?.();
  }

  return (
    <div className="card p-5">
      <h3 className="mb-1 font-display text-lg font-semibold text-bone">Participer au financement</h3>
      <p className="mb-4 text-sm text-muted">
        Choisissez votre montant, votre part est calculée automatiquement.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Prénom</label>
          <input className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" />
        </div>
        <div>
          <label className="label">Nom</label>
          <input className="field" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
        </div>
      </div>

      <div className="mt-3">
        <label className="label">Montant investi (€)</label>
        <input
          className="field font-mono"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50"
        />
      </div>

      {/* Aperçu automatique de la part */}
      {amount && previewShare > 0 && (
        <div className="mt-3 rounded-xl border border-jade-500/30 bg-jade-500/10 px-4 py-3 text-sm">
          Vous posséderez{' '}
          <span className="font-mono font-semibold text-jade-400">{percent(previewShare, 1)}</span>{' '}
          de la part vendue.
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && (
        <p className="mt-3 text-sm text-jade-400">Merci ! Votre participation a bien été enregistrée.</p>
      )}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-4 w-full">
        {loading ? 'Enregistrement…' : 'Valider ma participation'}
      </button>
    </div>
  );
}
