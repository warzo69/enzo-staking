'use client';

import { motion } from 'framer-motion';
import { euro, percent } from '@/lib/format';

/**
 * Barre de progression du financement.
 * - collected : montant déjà collecté
 * - sought    : montant recherché
 * - full      : vrai quand le tournoi est "Complet"
 */
export default function ProgressBar({ collected = 0, sought = 0, full = false }) {
  const pct = sought > 0 ? Math.min(100, (collected / sought) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <div>
          <span className="stat-label">Collecté</span>
          <p className="font-mono text-xl font-semibold text-jade-400">{euro(collected)}</p>
        </div>
        <div className="text-right">
          <span className="stat-label">Objectif</span>
          <p className="font-mono text-xl font-semibold text-bone">{euro(sought)}</p>
        </div>
      </div>

      {/* La barre */}
      <div className="relative h-4 w-full overflow-hidden rounded-full border border-ink-700 bg-ink-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            full ? 'bg-gold-400' : 'bg-gradient-to-r from-jade-600 to-jade-400'
          }`}
          // Texture "jetons" : fines rayures verticales
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 14px)',
            backgroundBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={`font-mono font-semibold ${full ? 'text-gold-400' : 'text-jade-400'}`}>
          {percent(pct, pct < 100 && pct > 0 ? 1 : 0)}
        </span>
        {full ? (
          <span className="chip border-gold-400/40 text-gold-300">✔ Complet</span>
        ) : (
          <span className="text-muted">
            Reste {euro(Math.max(0, sought - collected))}
          </span>
        )}
      </div>
    </div>
  );
}
