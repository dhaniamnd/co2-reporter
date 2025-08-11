import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      container: { center: true, padding: '1rem' },
      colors: {
        brand: {
         100: '#d2e6b5',
         200: '#c1db9b',
         300: '#b1cf86',
         400: '#a0c172',
         500: '#8eb15c'
        }
      }
    },
  },
  plugins: []
} satisfies Config;