'use client';

import { euro, percent, investorShareOfSold, investorReturn } from '@/lib/format';

/**
 * Liste des investisseurs d'un tournoi.
 * - investors : tableau des participants
 * - sought    : montant recherché (pour calculer les parts)
 * - finished  : tournoi terminé ? (affiche alors les remboursements)
 * - buyIn / payout : nécessaires au calcul des remboursements
 */
export default function InvestorList({ investors = [], sought = 0, finished = false, buyIn = 0, payout = 0 }) {
  if (investors.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-muted">
        Aucun investisseur pour le moment. Soyez le premier à participer !
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-800 px-5 py-3">
        <h3 className="font-display font-semibold text-bone">
          Investisseurs <span className="text-muted">({investors.length})</span>
        </h3>
      </div>

      <ul className="divide-y divide-ink-800">
        {investors.map((inv) => {
          const share = investorShareOfSold(inv.amount, sought);
          const back = finished ? investorReturn(payout, buyIn, inv.amount) : null;
          const net = back !== null ? back - Number(inv.amount) : null;

          return (
            <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-bone">
                  {inv.first_name} {inv.last_name}
                </p>
                <p className="text-xs text-muted">{percent(share, 1)} de la part vendue</p>
              </div>

              <div className="text-right">
                <p className="font-mono text-bone">{euro(inv.amount)}</p>
                {finished && (
                  <p className={`font-mono text-xs ${net >= 0 ? 'text-jade-400' : 'text-red-400'}`}>
                    → {euro(back)} ({net >= 0 ? '+' : ''}{euro(net)})
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
