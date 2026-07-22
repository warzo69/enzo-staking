'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Liens principaux du site
const links = [
  { href: '/', label: 'Accueil' },
  { href: '/tournois', label: 'Tournois' },
  { href: '/historique', label: 'Historique' },
  { href: '/statistiques', label: 'Statistiques' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Un lien est "actif" si l'URL commence par son chemin
  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-900/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo / nom */}
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-bone">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-jade-500 text-ink-950">♠</span>
          Enzo&nbsp;Noury
        </Link>

        {/* Liens (ordinateur) */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? 'bg-ink-800 text-jade-400'
                  : 'text-muted hover:text-bone'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="btn-ghost ml-2 px-4 py-2 text-sm">
            Espace admin
          </Link>
        </nav>

        {/* Bouton menu (mobile) */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 text-bone md:hidden"
          aria-label="Ouvrir le menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu déroulant (mobile) */}
      {open && (
        <nav className="border-t border-ink-800 bg-ink-900 px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                isActive(l.href) ? 'bg-ink-800 text-jade-400' : 'text-muted'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-4 py-3 text-sm font-medium text-jade-400"
          >
            Espace admin
          </Link>
        </nav>
      )}
    </header>
  );
}
