'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  euro, percent, dateFr, collected as sumCollected,
  grossProfit, roi, playerNet,
} from '@/lib/format';
import ProgressBar from '@/components/ProgressBar';
import StakingForm from '@/components/StakingForm';
import InvestorList from '@/components/InvestorList';
import LiveTracker from '@/components/LiveTracker';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charge (ou recharge) toutes les données du tournoi
  const load = useCallback(async () => {
    const [{ data: t }, { data: inv }, { data: upd }] = await Promise.all([
      supabase.from('tournaments').select('*').eq('id', id).single(),
      supabase.from('investors').select('*').eq('tournament_id', id).order('created_at'),
      supabase.from('live_updates').select('*').eq('tournament_id', id).order('created_at', { ascending: false }),
    ]);
    setTournament(t);
    setInvestors(inv || []);
    setUpdates(upd || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();

    // TEMPS RÉEL : on écoute les changements pour rafraîchir automatiquement
    const channel = supabase
      .channel(`tournoi-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors', filter: `tournament_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_updates', filter: `tournament_id=eq.${id}` }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, load]);

  if (loading) return <p className="text-muted">Chargement…</p>;
  if (!tournament) {
    return (
      <div className="card p-10 text-center">
        <p className="text-muted">Ce tournoi est introuvable.</p>
        <Link href="/tournois" className="btn-ghost mt-4">← Retour aux tournois</Link>
      </div>
    );
  }

  const t = tournament;
  const sought = Number(t.amount_sought) || 0;
  const collected = sumCollected(investors);
  const remaining = Math.max(0, sought - collected);
  const full = sought > 0 && collected >= sought;
  const canInvest = t.staking_open && !full && !t.is_finished;

  const infoRows = [
    ['Casino', t.casino || '—'],
    ['Ville', t.city || '—'],
    ['Date', dateFr(t.event_date) + (t.event_time ? ` · ${t.event_time}` : '')],
    ['Buy-in', euro(t.buy_in)],
    ['Prizepool garanti', t.guaranteed_prizepool ? euro(t.guaranteed_prizepool) : '—'],
    ['Joueurs attendus', t.expected_players || '—'],
    ['Part vendue', percent(t.percent_sold, 0)],
  ];

  return (
    <div>
      <Link href="/tournois" className="mb-6 inline-block text-sm text-muted hover:text-jade-400">
        ← Tous les tournois
      </Link>

      {/* En-tête */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {t.is_live && <span className="chip border-red-500/40 text-red-400 animate-pulse-dot">● En direct</span>}
          {full && !t.is_finished && <span className="chip border-gold-400/40 text-gold-300">Complet</span>}
          {t.is_finished && <span className="chip">Terminé</span>}
          {!t.staking_open && !t.is_finished && !full && <span className="chip">Financement fermé</span>}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-bone sm:text-4xl">{t.name}</h1>
        <p className="mt-1 text-muted">{[t.casino, t.city].filter(Boolean).join(' · ')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        {/* ------------------------------------------------- Colonne principale */}
        <div className="space-y-6">
          {/* Infos du tournoi */}
          <div className="card p-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {infoRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="stat-label">{label}</dt>
                  <dd className="mt-0.5 font-mono text-bone">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Suivi en direct */}
          {t.is_live && <LiveTracker t={t} updates={updates} />}

          {/* Résultat final */}
          {t.is_finished && <ResultCard t={t} />}

          {/* Liste des investisseurs */}
          <InvestorList
            investors={investors}
            sought={sought}
            finished={t.is_finished}
            buyIn={t.buy_in}
            payout={t.payout}
          />
        </div>

        {/* --------------------------------------------------- Colonne latérale */}
        <div className="space-y-6">
          {/* Progression du financement */}
          {!t.is_finished && (
            <div className="card p-5">
              <ProgressBar collected={collected} sought={sought} full={full} />
            </div>
          )}

          {/* Formulaire de participation */}
          {canInvest ? (
            <StakingForm tournamentId={t.id} sought={sought} remaining={remaining} onDone={load} />
          ) : !t.is_finished ? (
            <div className="card p-6 text-center text-sm text-muted">
              {full ? 'Ce tournoi est entièrement financé. Merci à tous !' : 'Le financement de ce tournoi est fermé.'}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Carte de résultat affichée quand le tournoi est terminé
function ResultCard({ t }) {
  const profit = grossProfit(t.payout, t.buy_in);
  const roiPct = roi(t.payout, t.buy_in);
  const enzoNet = playerNet(t.payout, t.buy_in, t.percent_sold);
  const positive = profit >= 0;

  const cells = [
    ['Place', t.final_place ? `${t.final_place}e${t.total_players ? ` / ${t.total_players}` : ''}` : '—'],
    ['Gain', euro(t.payout)],
    ['Résultat brut', `${positive ? '+' : ''}${euro(profit)}`],
    ['ROI', percent(roiPct, 0)],
    ['Ma part nette', `${enzoNet >= 0 ? '+' : ''}${euro(enzoNet)}`],
  ];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-800 px-5 py-3">
        <h3 className="font-display font-semibold text-bone">Résultat du tournoi</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-ink-800 sm:grid-cols-3">
        {cells.map(([label, value], i) => (
          <div key={label} className="bg-ink-850 px-4 py-4">
            <span className="stat-label">{label}</span>
            <p className={`mt-1 font-mono text-lg font-semibold ${
              (i === 2 || i === 3 || i === 4) ? (positive ? 'text-jade-400' : 'text-red-400') : 'text-bone'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      {t.result_comment && (
        <div className="border-t border-ink-800 px-5 py-3 text-sm text-muted">« {t.result_comment} »</div>
      )}
    </div>
  );
}
