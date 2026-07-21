import type { Config } from 'tailwindcss'

// Tokens mirror design.md §3–§7. Keep in sync.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 900: '#123524', 800: '#1B4D3E', 700: '#2A6049' },
        ink: { DEFAULT: '#2A2320', soft: '#4A4038' },
        paper: { DEFAULT: '#FBF6EC', 2: '#FFFFFF' },
        muted: '#9BB0A6',
        grass: { 300: '#A0B070', 500: '#708040', 700: '#406030', 900: '#203020' },
        mint: { 100: '#E0F0D0' },
        sky: {
          cream: '#F0E0D0', gold: '#E0D090', peach: '#E0A080',
          coral: '#E09080', rose: '#D08080', mauve: '#907080',
        },
        cloud: '#F6ECD8',
        lime: { 400: '#B7E06A', 500: '#8FCB3C' },
        sun: { 400: '#F0D090' },
        berry: { 400: '#D08080' },
        tier: {
          vegan: '#8FCB3C', veg: '#7FB77E', fish: '#6FA8C7',
          chicken: '#E0B15A', pork: '#E39B9B', beef: '#B3736B',
        },
      },
      fontFamily: {
        pixel: ['Silkscreen', 'monospace'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: { pixel: '4px', 'pixel-sm': '2px' },
      boxShadow: {
        pixel: '0 3px 0 0 #2A2320',
        'pixel-sm': '0 2px 0 0 #2A2320',
        'pixel-inset': 'inset 0 2px 0 0 rgba(0,0,0,.2)',
      },
      maxWidth: { phone: '430px' },
      keyframes: {
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pop: { '0%': { transform: 'scale(0.9)' }, '60%': { transform: 'scale(1.06)' }, '100%': { transform: 'scale(1)' } },
        'slide-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
      },
      animation: {
        bob: 'bob 2s ease-in-out infinite',
        pop: 'pop 0.3s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
