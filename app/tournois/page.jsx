'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TournamentCard from '@/components/TournamentCard';

export default function TournoisPage() {
  const [tournaments, setTournaments] = useState([]);
  const [collectedById, setCollectedById] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Récupère les tournois + tous les investissements en une fois
      const [{ data: tours }, { data: investors }] = await Promise.all([
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
        supabase.from('investors').select('tournament_id, amount'),
      ]);

      // Calcule le montant collecté par tournoi
      const totals = {};
      (investors || []).forEach((i) => {
        totals[i.tournament_id] = (totals[i.tournament_id] || 0) + Number(i.amount);
      });

      setTournaments(tours || []);
      setCollectedById(totals);
      setLoading(false);
    }
    load();
  }, []);

  // Sépare les tournois actifs des tournois terminés
  const active = tournaments.filter((t) => !t.is_finished);
  const finished = tournaments.filter((t) => t.is_finished);

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Financement</span>
        <h1 className="font-display text-3xl font-bold text-bone">Les tournois</h1>
        <p className="mt-2 text-muted">Choisissez un tournoi pour investir ou suivre son déroulement.</p>
      </header>

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : tournaments.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          Aucun tournoi pour l'instant. Reviens bientôt !
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                À venir & en cours
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {active.map((t) => (
                  <TournamentCard key={t.id} tournament={t} collected={collectedById[t.id] || 0} />
                ))}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                Terminés
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {finished.map((t) => (
                  <TournamentCard key={t.id} tournament={t} collected={collectedById[t.id] || 0} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
