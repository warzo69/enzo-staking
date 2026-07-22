'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { euro, percent, grossProfit } from '@/lib/format';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Tooltip, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Enregistrement des modules Chart.js (obligatoire une fois)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

// Couleurs du thème réutilisées dans les graphiques
const JADE = '#12B886';
const GOLD = '#E4B95B';
const GRID = 'rgba(138,154,149,0.12)';
const TEXT = '#8A9A95';

export default function StatistiquesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_finished', true)
        .order('event_date', { ascending: true });
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // --- Indicateurs clés ---
  const stats = useMemo(() => {
    const n = rows.length;
    const totalBuyIns = rows.reduce((s, r) => s + (Number(r.buy_in) || 0), 0);
    const totalGains = rows.reduce((s, r) => s + (Number(r.payout) || 0), 0);
    const profit = totalGains - totalBuyIns;
    const roiPct = totalBuyIns > 0 ? (profit / totalBuyIns) * 100 : 0;
    const avgGain = n > 0 ? totalGains / n : 0;
    const places = rows.map((r) => r.final_place).filter(Boolean);
    const avgPlace = places.length ? places.reduce((a, b) => a + b, 0) / places.length : 0;
    const best = rows.reduce((b, r) => (grossProfit(r.payout, r.buy_in) > grossProfit(b?.payout, b?.buy_in) ? r : b), rows[0]);
    return { n, totalBuyIns, totalGains, profit, roiPct, avgGain, avgPlace, best };
  }, [rows]);

  // --- Courbe du profit cumulé ---
  const cumulative = useMemo(() => {
    let running = 0;
    return {
      labels: rows.map((r) => (r.event_date ? new Date(r.event_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) : '—')),
      data: rows.map((r) => (running += grossProfit(r.payout, r.buy_in))),
    };
  }, [rows]);

  // --- Profit par mois (année en cours) et par année ---
  const monthly = useMemo(() => buildMonthly(rows), [rows]);
  const yearly = useMemo(() => buildYearly(rows), [rows]);

  const keyStats = [
    { label: 'Tournois', value: stats.n },
    { label: 'Total buy-ins', value: euro(stats.totalBuyIns) },
    { label: 'Total gains', value: euro(stats.totalGains) },
    { label: 'Profit', value: `${stats.profit >= 0 ? '+' : ''}${euro(stats.profit)}`, accent: stats.profit >= 0 ? 'jade' : 'red' },
    { label: 'ROI', value: percent(stats.roiPct, 0), accent: stats.roiPct >= 0 ? 'jade' : 'red' },
    { label: 'Gain moyen', value: euro(stats.avgGain) },
    { label: 'Place moyenne', value: stats.avgPlace ? Math.round(stats.avgPlace) + 'e' : '—' },
    { label: 'Meilleur résultat', value: stats.best ? `+${euro(grossProfit(stats.best.payout, stats.best.buy_in))}` : '—', accent: 'gold' },
  ];

  if (loading) return <p className="text-muted">Chargement…</p>;

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Performance</span>
        <h1 className="font-display text-3xl font-bold text-bone">Statistiques</h1>
        <p className="mt-2 text-muted">L'évolution de mes résultats, tournoi après tournoi.</p>
      </header>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          Les statistiques apparaîtront une fois les premiers tournois terminés.
        </div>
      ) : (
        <>
          {/* Indicateurs clés */}
          <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {keyStats.map((s) => (
              <div key={s.label} className="card p-5">
                <span className="stat-label">{s.label}</span>
                <p className={`stat-value mt-1 ${
                  s.accent === 'jade' ? 'text-jade-400' : s.accent === 'red' ? 'text-red-400' : s.accent === 'gold' ? 'text-gold-400' : 'text-bone'
                }`}>
                  {s.value}
                </p>
              </div>
            ))}
          </section>

          {/* Courbe du profit cumulé */}
          <section className="card mb-6 p-6">
            <h2 className="mb-4 font-display font-semibold text-bone">Évolution du profit cumulé</h2>
            <div className="h-72">
              <Line data={lineData(cumulative)} options={lineOptions} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mensuel */}
            <section className="card p-6">
              <h2 className="mb-4 font-display font-semibold text-bone">Profit par mois</h2>
              <div className="h-64">
                <Bar data={barData(monthly, JADE)} options={barOptions} />
              </div>
            </section>

            {/* Annuel */}
            <section className="card p-6">
              <h2 className="mb-4 font-display font-semibold text-bone">Profit par année</h2>
              <div className="h-64">
                <Bar data={barData(yearly, GOLD)} options={barOptions} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------------------- Données graphiques
function buildMonthly(rows) {
  const map = {};
  rows.forEach((r) => {
    if (!r.event_date) return;
    const d = new Date(r.event_date);
    const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    map[key] = (map[key] || 0) + grossProfit(r.payout, r.buy_in);
  });
  return { labels: Object.keys(map), data: Object.values(map) };
}

function buildYearly(rows) {
  const map = {};
  rows.forEach((r) => {
    if (!r.event_date) return;
    const y = new Date(r.event_date).getFullYear();
    map[y] = (map[y] || 0) + grossProfit(r.payout, r.buy_in);
  });
  const keys = Object.keys(map).sort();
  return { labels: keys, data: keys.map((k) => map[k]) };
}

// --------------------------------------------------------------- Config Chart.js
function lineData(c) {
  return {
    labels: c.labels,
    datasets: [{
      data: c.data,
      borderColor: JADE,
      backgroundColor: (ctx) => {
        const { ctx: c2, chartArea } = ctx.chart;
        if (!chartArea) return 'rgba(18,184,134,0.15)';
        const g = c2.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(18,184,134,0.35)');
        g.addColorStop(1, 'rgba(18,184,134,0)');
        return g;
      },
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: JADE,
      borderWidth: 2,
    }],
  };
}

function barData(d, color) {
  return {
    labels: d.labels,
    datasets: [{
      data: d.data,
      backgroundColor: d.data.map((v) => (v >= 0 ? color : 'rgba(239,68,68,0.7)')),
      borderRadius: 6,
      maxBarThickness: 48,
    }],
  };
}

const euroTick = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#121A18',
      borderColor: '#25322F',
      borderWidth: 1,
      titleColor: '#EDE9E0',
      bodyColor: '#EDE9E0',
      callbacks: { label: (i) => euro(i.parsed.y ?? i.parsed) },
    },
  },
};

const lineOptions = {
  ...baseOptions,
  scales: {
    x: { grid: { color: GRID }, ticks: { color: TEXT } },
    y: { grid: { color: GRID }, ticks: { color: TEXT, callback: euroTick } },
  },
};

const barOptions = {
  ...baseOptions,
  scales: {
    x: { grid: { display: false }, ticks: { color: TEXT } },
    y: { grid: { color: GRID }, ticks: { color: TEXT, callback: euroTick } },
  },
};
