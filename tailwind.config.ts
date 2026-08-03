import type { Config } from 'tailwindcss'

/**
 * Hand-drawn pass (v2). Neutral near-white canvas, deep-teal text, thin
 * cow-spot-black outlines, IBM Plex Mono everywhere except H1s (hand font).
 *
 * Legacy pixel-theme names (forest/lime/sky/mint/cloud/berry) are kept as
 * aliases remapped onto the neutral palette, so any surface not yet hand-styled
 * degrades to the new look instead of rendering dark. Remove once all screens
 * are migrated.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Canvas — "basically white", a touch warm so photos don't glare.
        paper: { DEFAULT: '#FAF9F5', 2: '#FFFFFF', 3: '#F2F1EB' },
        // Cow-spot black: dark, deliberately not pure #000.
        // ALL text, icons and outlines use this. design: one ink, no exceptions.
        ink: { DEFAULT: '#1C1B19', soft: '#6B6A64', faint: '#C9C7BF' },
        // `deep` is an alias of ink so existing text-deep markup stays correct.
        deep: { DEFAULT: '#1C1B19', soft: '#6B6A64', faint: '#C9C7BF' },
        // The one permitted light tone: secondary copy ("Get more information").
        muted: '#8A8A82',
        // THE ONLY COLOR IN THE APP — progress fill + accent marks.
        grass: { DEFAULT: '#5C7A45', light: '#8FA96F', pale: '#E8EDE0' },
        // Destructive actions only (sign out, delete). Never decorative.
        alert: { DEFAULT: '#B23B32', pale: '#F6E7E5' },
        // Neutralised: kept as tokens so illustration markup doesn't break.
        sun: '#EFEEE9',
        blush: '#EFEEE9',
        // Meal tiers are neutral now; tier is conveyed by the label, not color.
        tier: {
          vegan: '#F2F1EB', veg: '#F2F1EB', fish: '#F2F1EB',
          chicken: '#F2F1EB', pork: '#F2F1EB', beef: '#F2F1EB',
        },

        // ---- legacy aliases (remapped light; delete after full migration) ----
        forest: { 900: '#FAF9F5', 800: '#FFFFFF', 700: '#F2F1EB' },
        lime: { 300: '#E8EDE0', 400: '#E8EDE0', 500: '#5C7A45' },
        mint: { 100: '#E8EDE0' },
        cloud: '#F2F1EB',
        berry: { 400: '#9A6B63' },
        sky: {
          cream: '#FAF9F5', gold: '#FAF9F5', peach: '#FAF9F5',
          coral: '#FAF9F5', rose: '#FAF9F5', mauve: '#FAF9F5',
        },
      },
      fontFamily: {
        // H1 only. Self-hosted from /Schoolbell (see @font-face in styles/index.css).
        hand: ['Schoolbell', 'Bradley Hand', 'Segoe Print', 'cursive'],
        // Everything else.
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Legacy aliases so un-migrated markup still gets the mono voice.
        pixel: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        body: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '10px', pill: '999px', pixel: '10px', 'pixel-sm': '8px' },
      boxShadow: { pixel: 'none', 'pixel-sm': 'none' },
      maxWidth: { phone: '430px' },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.96)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
        'slide-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
      },
      animation: { pop: 'pop 0.3s ease-out', 'slide-up': 'slide-up 0.25s ease-out' },
    },
  },
  plugins: [],
} satisfies Config
