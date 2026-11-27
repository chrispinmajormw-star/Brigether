import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0F4C4C', 50: '#E6F0F0', 700: '#0F4C4C', 900: '#072626' },
        gold: { DEFAULT: '#E0A526', 50: '#FBF3E1', 600: '#E0A526' },
        cream: '#F7F5F0',
      },
      fontFamily: { sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
