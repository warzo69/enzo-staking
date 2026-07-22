import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Enzo Noury — Staking Poker',
  description: 'Financez mes tournois de poker et partagez mes résultats. ROI, stats et suivi en direct.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Polices Google chargées directement (robuste, pas besoin de réseau à la compilation) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-ink-800 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} Enzo Noury — Staking Poker</p>
          <p className="mt-1 text-xs">
            Le staking comporte des risques. Ne misez que ce que vous pouvez vous permettre de perdre.
          </p>
        </footer>
      </body>
    </html>
  );
}
