'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { euro, percent, investorShareOfSold } from '@/lib/format';

/**
 * Formulaire pour qu'un visiteur participe au financement.
 * - tournamentId : le tournoi concerné
 * - sought       : montant recherché (pour calculer la part)
 * - remaining    : montant restant à collecter
 * - paymentInfo  : instructions de paiement (saisies dans l'espace admin)
 * - onDone       : appelé après un ajout réussi (pour rafraîchir la liste)
 */
export default function StakingForm({ tournamentId, sought = 0, remaining = 0, paymentInfo = '', onDone }) {
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
        <div className="mt-3 rounded-xl border border-jade-500/40 bg-jade-500/10 p-4">
          <p className="font-medium text-jade-400">Participation enregistrée ✔</p>
          <p className="mt-1 text-sm text-muted">
            Dernière étape : effectuez le règlement pour valider votre part.
          </p>
          {paymentInfo ? (
            <div className="mt-3 rounded-lg border border-ink-700 bg-ink-900 p-3">
              <p className="mb-1 text-xs uppercase tracking-widest text-muted">Comment régler</p>
              <p className="whitespace-pre-wrap text-sm text-bone">{paymentInfo}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Contactez-moi directement pour convenir du règlement.
            </p>
          )}
          <button onClick={() => setSuccess(false)} className="btn-ghost mt-3 w-full">
            Ajouter une autre participation
          </button>
        </div>
      )}

      {!success && (
        <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-4 w-full">
          {loading ? 'Enregistrement…' : 'Valider ma participation'}
        </button>
      )}

      <p className="mt-4 border-t border-ink-800 pt-3 text-[11px] leading-relaxed text-muted">
        Staking entre particuliers, à titre privé. Votre participation n'est pas un placement
        financier : le résultat dépend d'un tournoi de poker et la perte peut être totale.
        Ne misez que ce que vous pouvez vous permettre de perdre.
      </p>
    </div>
  );
}
