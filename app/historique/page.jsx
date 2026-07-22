'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { euro, percent, dateShort, grossProfit, roi } from '@/lib/format';

export default function HistoriquePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [year, setYear] = useState('all');
  const [casino, setCasino] = useState('all');
  const [buyIn, setBuyIn] = useState('all');
  const [result, setResult] = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_finished', true)
        .order('event_date', { ascending: false });
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // Valeurs possibles pour les listes déroulantes
  const years = useMemo(
    () => [...new Set(rows.map((r) => r.event_date && new Date(r.event_date).getFullYear()).filter(Boolean))].sort((a, b) => b - a),
    [rows]
  );
  const casinos = useMemo(
    () => [...new Set(rows.map((r) => r.casino).filter(Boolean))].sort(),
    [rows]
  );

  // Application des filtres
  const filtered = rows.filter((r) => {
    if (year !== 'all' && (!r.event_date || new Date(r.event_date).getFullYear() !== Number(year))) return false;
    if (casino !== 'all' && r.casino !== casino) return false;
    if (buyIn !== 'all') {
      const b = Number(r.buy_in) || 0;
      if (buyIn === 'low' && b >= 500) return false;
      if (buyIn === 'mid' && (b < 500 || b > 1500)) return false;
      if (buyIn === 'high' && b <= 1500) return false;
    }
    if (result !== 'all') {
      const profit = grossProfit(r.payout, r.buy_in);
      if (result === 'win' && profit < 0) return false;
      if (result === 'loss' && profit >= 0) return false;
    }
    return true;
  });

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Palmarès</span>
        <h1 className="font-display text-3xl font-bold text-bone">Historique</h1>
        <p className="mt-2 text-muted">Tous mes tournois terminés, avec leurs résultats.</p>
      </header>

      {/* Filtres */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Select label="Année" value={year} onChange={setYear} options={[['all', 'Toutes'], ...years.map((y) => [String(y), String(y)])]} />
        <Select label="Casino" value={casino} onChange={setCasino} options={[['all', 'Tous'], ...casinos.map((c) => [c, c])]} />
        <Select label="Buy-in" value={buyIn} onChange={setBuyIn} options={[['all', 'Tous'], ['low', '< 500 €'], ['mid', '500 – 1500 €'], ['high', '> 1500 €']]} />
        <Select label="Résultat" value={result} onChange={setResult} options={[['all', 'Tous'], ['win', 'Gagnants'], ['loss', 'Perdants']]} />
      </div>

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-muted">Aucun tournoi ne correspond à ces filtres.</div>
      ) : (
        <>
          {/* Version tableau (ordinateur) */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-muted">
                  <Th>Date</Th><Th>Tournoi</Th><Th right>Buy-in</Th><Th right>Place</Th>
                  <Th right>Gain</Th><Th right>ROI</Th><Th right>Profit</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const profit = grossProfit(r.payout, r.buy_in);
                  const pos = profit >= 0;
                  return (
                    <tr key={r.id} className="border-b border-ink-800/60 transition hover:bg-ink-800/40">
                      <Td>{dateShort(r.event_date)}</Td>
                      <Td>
                        <Link href={`/tournois/${r.id}`} className="font-medium text-bone hover:text-jade-400">
                          {r.name}
                        </Link>
                        <span className="block text-xs text-muted">{r.casino}</span>
                      </Td>
                      <Td right mono>{euro(r.buy_in)}</Td>
                      <Td right mono>{r.final_place ? `${r.final_place}e` : '—'}</Td>
                      <Td right mono>{euro(r.payout)}</Td>
                      <Td right mono className={pos ? 'text-jade-400' : 'text-red-400'}>{percent(roi(r.payout, r.buy_in), 0)}</Td>
                      <Td right mono className={pos ? 'text-jade-400' : 'text-red-400'}>{pos ? '+' : ''}{euro(profit)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Version cartes (mobile) */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => {
              const profit = grossProfit(r.payout, r.buy_in);
              const pos = profit >= 0;
              return (
                <Link key={r.id} href={`/tournois/${r.id}`} className="card block p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-bone">{r.name}</p>
                      <p className="text-xs text-muted">{dateShort(r.event_date)} · {r.casino}</p>
                    </div>
                    <span className={`font-mono font-semibold ${pos ? 'text-jade-400' : 'text-red-400'}`}>
                      {pos ? '+' : ''}{euro(profit)}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-muted">
                    <span>Buy-in <span className="font-mono text-bone">{euro(r.buy_in)}</span></span>
                    <span>Place <span className="font-mono text-bone">{r.final_place ? `${r.final_place}e` : '—'}</span></span>
                    <span>ROI <span className={`font-mono ${pos ? 'text-jade-400' : 'text-red-400'}`}>{percent(roi(r.payout, r.buy_in), 0)}</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- Composants d'aide ---
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
function Th({ children, right }) {
  return <th className={`px-4 py-3 font-medium ${right ? 'text-right' : ''}`}>{children}</th>;
}
function Td({ children, right, mono, className = '' }) {
  return <td className={`px-4 py-3 ${right ? 'text-right' : ''} ${mono ? 'font-mono' : ''} ${className}`}>{children}</td>;
}
