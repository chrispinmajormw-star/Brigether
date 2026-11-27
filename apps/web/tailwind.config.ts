import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0F6B4F', dark: '#0A4A38', soft: '#DDEEE5' },
        sun: '#F2A900',
        bubble: '#B8481C',
        danger: '#D62839',
        surface: '#F3E7CF',
        panel: '#F8F0DF',
        ink: '#2A1A10',
        cream: '#FBF5E8',
        teal: { DEFAULT: '#0F6B4F', 50: '#DDEEE5', 700: '#0A4A38', 900: '#073528' },
        gold: { DEFAULT: '#B8481C', 50: '#F6E3D8', 600: '#B8481C' },
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;