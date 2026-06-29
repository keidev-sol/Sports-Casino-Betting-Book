/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium "stadium" palette — deep navy + gold + pitch green.
        // Token names kept stable so every component re-themes at once;
        // the `neon.*` family is now a gold-led accent set.
        ink: {
          950: '#050a14',
          900: '#0a1222',
          850: '#0e1830',
          800: '#142243',
          750: '#1b2c52',
          700: '#243562',
          600: '#324a82',
        },
        neon: {
          purple: '#e8b923', // primary gold
          violet: '#f4d168', // light gold
          green: '#19c964', // pitch green / wins
          lime: '#4ade80',
          pink: '#f0a52e', // amber (gradient partner for gold)
          gold: '#ffc233',
          cyan: '#3aa0ff', // chip blue accent
          red: '#ff4d6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 22px -2px rgba(232,185,35,0.55)',
        'glow-green': '0 0 22px -2px rgba(25,201,100,0.5)',
        'glow-gold': '0 0 26px -2px rgba(255,194,51,0.55)',
        card: '0 10px 34px -14px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(232,185,35,0.12), transparent 60%)',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // floating aurora blobs in the page background
        float: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-30px) scale(1.08)' },
          '66%': { transform: 'translate(-30px,20px) scale(0.96)' },
        },
        // slow Ken-Burns zoom for the hero image
        kenburns: {
          '0%': { transform: 'scale(1) translate(0,0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%,-1.5%)' },
        },
        // light sweep across buttons / cards
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '60%,100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
        // animated gradient panning (gold text / borders)
        gradientPan: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.92)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        spinSlow: { '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        rise: 'rise 0.35s ease-out',
        marquee: 'marquee 40s linear infinite',
        float: 'float 18s ease-in-out infinite',
        kenburns: 'kenburns 18s ease-in-out infinite alternate',
        shine: 'shine 4.5s ease-in-out infinite',
        gradientPan: 'gradientPan 6s ease infinite',
        shimmer: 'shimmer 1.6s infinite',
        popIn: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        spinSlow: 'spinSlow 14s linear infinite',
      },
    },
  },
  plugins: [],
};
