'use client';

import { euro } from '@/lib/format';

/**
 * Affiche l'état "en direct" d'un tournoi + le fil des mises à jour.
 * - t       : le tournoi (contient les champs live)
 * - updates : le fil de messages ("Break dîner", "ITM !"…)
 */
export default function LiveTracker({ t, updates = [] }) {
  const stats = [
    { label: 'Joueurs restants', value: t.players_left ?? '—' },
    { label: 'Mon tapis', value: t.my_stack != null ? Number(t.my_stack).toLocaleString('fr-FR') : '—' },
    { label: 'Blindes', value: t.blinds || '—' },
    { label: 'Prochain palier', value: t.next_level || '—' },
    { label: 'Gain actuel', value: t.current_prize != null ? euro(t.current_prize) : '—' },
    { label: 'Ma position', value: t.position || '—' },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-800 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse-dot" />
        <h3 className="font-display font-semibold text-bone">Suivi en direct</h3>
      </div>

      {/* Grille de stats live */}
      <div className="grid grid-cols-2 gap-px bg-ink-800 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink-850 px-4 py-4">
            <span className="stat-label">{s.label}</span>
            <p className="mt-1 font-mono text-lg font-semibold text-bone">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Commentaire épinglé */}
      {t.live_comment && (
        <div className="border-t border-ink-800 bg-jade-500/5 px-5 py-3 text-sm text-jade-300">
          « {t.live_comment} »
        </div>
      )}

      {/* Fil des mises à jour */}
      {updates.length > 0 && (
        <div className="border-t border-ink-800 px-5 py-4">
          <span className="stat-label">Fil du tournoi</span>
          <ul className="mt-3 space-y-3">
            {updates.map((u) => (
              <li key={u.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-500" />
                <div>
                  <p className="text-bone">{u.message}</p>
                  <p className="text-xs text-muted">
                    {new Date(u.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
