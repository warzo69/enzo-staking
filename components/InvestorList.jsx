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

  const nbAttente = investors.filter((i) => !i.paid).length;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-800 px-5 py-3">
        <h3 className="font-display font-semibold text-bone">
          Investisseurs <span className="text-muted">({investors.length})</span>
        </h3>
        {nbAttente > 0 && !finished && (
          <span className="text-xs text-muted">{nbAttente} en attente de règlement</span>
        )}
      </div>

      <ul className="divide-y divide-ink-800">
        {investors.map((inv) => {
          const share = investorShareOfSold(inv.amount, sought);
          const back = finished ? investorReturn(payout, buyIn, inv.amount) : null;
          const net = back !== null ? back - Number(inv.amount) : null;

          return (
            <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-medium text-bone">
                  {inv.first_name} {inv.last_name}
                  {inv.paid ? (
                    <span className="shrink-0 rounded-md border border-jade-500/40 px-1.5 py-0.5 text-[10px] font-medium text-jade-400">
                      réglé
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md border border-ink-700 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      en attente
                    </span>
                  )}
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
