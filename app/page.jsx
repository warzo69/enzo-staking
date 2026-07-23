'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { euro, percent } from '@/lib/format';

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // On récupère le profil et tous les tournois terminés (pour les stats)
      const [{ data: prof }, { data: tours }] = await Promise.all([
        supabase.from('profile').select('*').eq('id', 1).single(),
        supabase.from('tournaments').select('*').eq('is_finished', true),
      ]);
      setProfile(prof);
      setTournaments(tours || []);
      setLoading(false);
    }
    load();
  }, []);

  // --- Calcul des statistiques principales à partir des tournois terminés ---
  const totalBuyIns = tournaments.reduce((s, t) => s + (Number(t.buy_in) || 0), 0);
  const totalGains = tournaments.reduce((s, t) => s + (Number(t.payout) || 0), 0);
  const profit = totalGains - totalBuyIns;
  const roiPct = totalBuyIns > 0 ? (profit / totalBuyIns) * 100 : 0;

  const heroStats = [
    { label: 'ROI', value: percent(roiPct, 0), accent: roiPct >= 0 },
    { label: 'Gains cumulés', value: euro(totalGains), accent: true },
    { label: 'Bénéfice', value: `${profit >= 0 ? '+' : ''}${euro(profit)}`, accent: profit >= 0 },
    { label: 'Tournois joués', value: tournaments.length, accent: true },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="grid items-center gap-10 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Staking Poker</span>
          <h1 className="font-display text-4xl font-bold leading-tight text-bone sm:text-5xl">
            {profile?.full_name || 'Enzo Nourry'}
          </h1>
          {profile?.pseudo && (
            <p className="mt-2 font-mono text-jade-400">« {profile.pseudo} »</p>
          )}
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            {profile?.bio || 'Joueur de poker en tournois live. Financez une partie de mes tournois et partagez mes résultats.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tournois" className="btn-primary">Voir les tournois →</Link>
            <Link href="/statistiques" className="btn-ghost">Mes statistiques</Link>
          </div>
        </motion.div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-4 rounded-3xl bg-jade-500/10 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink-700 bg-ink-850">
            {profile?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-6xl text-ink-600">♠</div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------ STATS PRINCIPALES */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {heroStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
            className="card p-5"
          >
            <span className="stat-label">{s.label}</span>
            <p className={`stat-value mt-1 ${s.accent ? 'text-jade-400' : 'text-red-400'}`}>
              {loading ? '…' : s.value}
            </p>
          </motion.div>
        ))}
      </section>

      {/* -------------------------------------------------------------- BANDEAU */}
      <section className="card mt-10 flex flex-col items-center gap-4 bg-felt p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-xl font-semibold text-bone">Envie de miser sur moi ?</h2>
          <p className="mt-1 text-muted">Financez une part de mes prochains tournois en quelques clics.</p>
        </div>
        <Link href="/tournois" className="btn-primary shrink-0">Découvrir les tournois</Link>
      </section>
    </div>
  );
}
