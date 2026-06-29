/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neon dark palette
        ink: {
          950: '#0a0911',
          900: '#0d0c16',
          850: '#12111f',
          800: '#171527',
          750: '#1d1b30',
          700: '#242238',
          600: '#2f2c47',
        },
        neon: {
          purple: '#7c5cff',
          violet: '#9d7bff',
          green: '#00e701',
          lime: '#3dff7a',
          pink: '#ff4d8d',
          gold: '#ffb800',
          cyan: '#22d3ee',
          red: '#ff3b5c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -2px rgba(124,92,255,0.55)',
        'glow-green': '0 0 22px -2px rgba(0,231,1,0.5)',
        'glow-gold': '0 0 22px -2px rgba(255,184,0,0.5)',
        card: '0 8px 30px -12px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(124,92,255,0.12), transparent 60%)',
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
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        rise: 'rise 0.35s ease-out',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
