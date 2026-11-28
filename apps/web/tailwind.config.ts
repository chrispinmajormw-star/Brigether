import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#F4631E', dark: '#D94E0E', soft: '#FFEDE3' },
        forest: '#0E3B35',
        ink: '#17130F',
        cream: '#FAF6EF',
        sand: '#EFE8DB',
        danger: '#D7263D',
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      keyframes: { orbit: { to: { transform: 'rotate(360deg)' } } },
      animation: { orbit: 'orbit 60s linear infinite' },
    },
  },
  plugins: [],
};
export default config;