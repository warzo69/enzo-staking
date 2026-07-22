/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fonds "charbon chaud"
        ink: {
          950: '#080B0A',
          900: '#0B0F0E',
          850: '#0E1513',
          800: '#121A18',
          700: '#1A2523',
          600: '#25322F',
        },
        // Vert émeraude bijou (le tapis de poker, en version premium)
        jade: {
          400: '#34D8A0',
          500: '#12B886',
          600: '#0E9A72',
          700: '#0B7A5B',
        },
        // Or discret, réservé à l'argent
        gold: {
          300: '#F3D89A',
          400: '#E4B95B',
          500: '#CDA24A',
        },
        bone: '#EDE9E0',
        muted: '#8A9A95',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(18, 184, 134, 0.35)',
        card: '0 20px 50px -20px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'felt': 'radial-gradient(circle at 30% 20%, rgba(18,184,134,0.08), transparent 60%), radial-gradient(circle at 80% 80%, rgba(228,185,91,0.05), transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
