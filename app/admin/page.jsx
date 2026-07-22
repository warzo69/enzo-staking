'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { euro, amountSought } from '@/lib/format';
import AdminTournamentEditor from '@/components/AdminTournamentEditor';

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // session vérifiée ?
  const [tournaments, setTournaments] = useState([]);
  const [profile, setProfile] = useState(null);

  // Recharge la liste des tournois et le profil
  const load = useCallback(async () => {
    const [{ data: tours }, { data: prof }] = await Promise.all([
      supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
      supabase.from('profile').select('*').eq('id', 1).single(),
    ]);
    setTournaments(tours || []);
    setProfile(prof);
  }, []);

  // Vérifie la connexion : sinon, redirige vers la page de login
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login');
      } else {
        setReady(true);
        load();
      }
    });
  }, [router, load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  if (!ready) return <p className="text-muted">Vérification…</p>;

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <span className="eyebrow">Espace privé</span>
          <h1 className="font-display text-3xl font-bold text-bone">Tableau de bord</h1>
        </div>
        <button onClick={signOut} className="btn-ghost">Déconnexion</button>
      </header>

      {/* Profil */}
      {profile && <ProfileEditor profile={profile} onChange={load} />}

      {/* Nouveau tournoi */}
      <NewTournament onCreated={load} />

      {/* Liste des tournois */}
      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
          Mes tournois ({tournaments.length})
        </h2>
        {tournaments.length === 0 ? (
          <div className="card p-8 text-center text-muted">Crée ton premier tournoi ci-dessus.</div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <AdminTournamentEditor key={t.id} tournament={t} onChange={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- PROFIL
function ProfileEditor({ profile, onChange }) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from('profile')
      .update({
        full_name: form.full_name,
        pseudo: form.pseudo,
        photo_url: form.photo_url,
        bio: form.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); onChange?.(); }
    else alert('Erreur.');
  }

  return (
    <section className="card mb-8 p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-bone">Mon profil (page d'accueil)</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nom complet</label>
          <input className="field" value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} />
        </div>
        <div>
          <label className="label">Pseudo poker</label>
          <input className="field" value={form.pseudo || ''} onChange={(e) => set('pseudo', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Lien de ma photo (URL d'image)</label>
          <input className="field" value={form.photo_url || ''} onChange={(e) => set('photo_url', e.target.value)} placeholder="https://…/ma-photo.jpg" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Présentation</label>
          <textarea className="field min-h-[90px]" value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement…' : 'Enregistrer le profil'}
        </button>
        {saved && <span className="text-sm text-jade-400">Enregistré ✔</span>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------- NOUVEAU TOURNOI
function NewTournament({ onCreated }) {
  const empty = {
    name: '', casino: '', city: '', event_date: '', event_time: '',
    buy_in: '', guaranteed_prizepool: '', expected_players: '', percent_sold: '',
  };
  const [form, setForm] = useState(empty);
  const [creating, setCreating] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const num = (v) => parseFloat(String(v ?? '').replace(',', '.')) || 0;
  const soughtPreview = amountSought(num(form.buy_in), num(form.percent_sold));

  async function create() {
    if (!form.name.trim()) return alert('Donne un nom au tournoi.');
    setCreating(true);
    const { error } = await supabase.from('tournaments').insert({
      name: form.name.trim(),
      casino: form.casino,
      city: form.city,
      event_date: form.event_date || null,
      event_time: form.event_time,
      buy_in: num(form.buy_in),
      guaranteed_prizepool: num(form.guaranteed_prizepool),
      expected_players: parseInt(form.expected_players, 10) || 0,
      percent_sold: num(form.percent_sold),
      amount_sought: amountSought(num(form.buy_in), num(form.percent_sold)),
      staking_open: true,
    });
    setCreating(false);
    if (!error) { setForm(empty); onCreated?.(); }
    else alert('Erreur lors de la création.');
  }

  return (
    <section className="card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-bone">Créer un tournoi</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="label">Nom du tournoi</label>
          <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Main Event WSOP Paris" />
        </div>
        <div>
          <label className="label">Casino</label>
          <input className="field" value={form.casino} onChange={(e) => set('casino', e.target.value)} />
        </div>
        <div>
          <label className="label">Ville</label>
          <input className="field" value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="field" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
        </div>
        <div>
          <label className="label">Heure</label>
          <input className="field" value={form.event_time} onChange={(e) => set('event_time', e.target.value)} placeholder="20:00" />
        </div>
        <div>
          <label className="label">Buy-in (€)</label>
          <input className="field font-mono" value={form.buy_in} onChange={(e) => set('buy_in', e.target.value)} placeholder="500" />
        </div>
        <div>
          <label className="label">Prizepool garanti (€)</label>
          <input className="field font-mono" value={form.guaranteed_prizepool} onChange={(e) => set('guaranteed_prizepool', e.target.value)} />
        </div>
        <div>
          <label className="label">Joueurs attendus</label>
          <input className="field font-mono" value={form.expected_players} onChange={(e) => set('expected_players', e.target.value)} />
        </div>
        <div>
          <label className="label">Pourcentage vendu (%)</label>
          <input className="field font-mono" value={form.percent_sold} onChange={(e) => set('percent_sold', e.target.value)} placeholder="50" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="rounded-xl border border-jade-500/30 bg-jade-500/10 px-4 py-2">
          <span className="stat-label">Je cherche</span>
          <span className="ml-2 font-mono font-semibold text-jade-400">{euro(soughtPreview)}</span>
        </div>
        <button onClick={create} disabled={creating} className="btn-primary">
          {creating ? 'Création…' : 'Créer le tournoi'}
        </button>
      </div>
    </section>
  );
}
