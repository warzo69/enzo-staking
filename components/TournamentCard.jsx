'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { euro, dateFr } from '@/lib/format';
import ProgressBar from './ProgressBar';

/**
 * Carte d'un tournoi.
 * - tournament : la ligne du tournoi
 * - collected  : montant déjà collecté (calculé par la page parente)
 */
export default function TournamentCard({ tournament, collected = 0 }) {
  const t = tournament;
  const sought = Number(t.amount_sought) || 0;
  const full = sought > 0 && collected >= sought;

  // Détermine le statut affiché en haut à droite
  let status = { label: 'Ouvert', className: 'text-jade-400 border-jade-500/40' };
  if (t.is_finished) status = { label: 'Terminé', className: 'text-muted' };
  else if (t.is_live) status = { label: '● En direct', className: 'text-red-400 border-red-500/40 animate-pulse-dot' };
  else if (!t.staking_open || full) status = { label: full ? 'Complet' : 'Fermé', className: 'text-gold-300 border-gold-400/40' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <Link href={`/tournois/${t.id}`}>
        <div className="card group h-full p-5 transition hover:border-jade-500/40 hover:shadow-glow">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-bone group-hover:text-jade-400">
                {t.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                {[t.casino, t.city].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className={`chip whitespace-nowrap ${status.className}`}>{status.label}</span>
          </div>

          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-muted">
              {dateFr(t.event_date)} {t.event_time && `· ${t.event_time}`}
            </span>
            <span className="font-mono text-bone">Buy-in {euro(t.buy_in)}</span>
          </div>

          {t.is_finished ? (
            <FinishedSummary t={t} />
          ) : (
            <ProgressBar collected={collected} sought={sought} full={full} />
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// Petit résumé affiché quand le tournoi est terminé
function FinishedSummary({ t }) {
  const profit = (Number(t.payout) || 0) - (Number(t.buy_in) || 0);
  const positive = profit >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 px-4 py-3">
      <div>
        <span className="stat-label">Place</span>
        <p className="font-mono text-lg text-bone">
          {t.final_place ? `${t.final_place}e` : '—'}
          {t.total_players ? <span className="text-muted"> / {t.total_players}</span> : null}
        </p>
      </div>
      <div className="text-right">
        <span className="stat-label">Résultat</span>
        <p className={`font-mono text-lg font-semibold ${positive ? 'text-jade-400' : 'text-red-400'}`}>
          {positive ? '+' : ''}{euro(profit)}
        </p>
      </div>
    </div>
  );
}
