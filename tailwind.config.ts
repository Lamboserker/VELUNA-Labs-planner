import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}', './app/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['Geist Mono', ...fontFamily.mono]
      },
      colors: {
        brand: '#4f46e5'
      },
      borderRadius: {
        lg: '1rem'
      }
    }
  },
  plugins: []
};

export default config;
