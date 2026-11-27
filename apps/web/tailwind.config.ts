import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1F5FFF', dark: '#1748C9', soft: '#E8EEFF' },
        bubble: '#6C63E6',
        danger: '#F0284A',
        surface: '#E9ECF6',
        panel: '#F4F5F9',
        ink: '#1B1B2F',
        teal: { DEFAULT: '#1F5FFF', 50: '#E8EEFF', 700: '#1748C9', 900: '#10328F' },
        gold: { DEFAULT: '#6C63E6', 50: '#EEEDFC', 600: '#6C63E6' },
        cream: '#E9ECF6',
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;