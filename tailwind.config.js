/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Nunito', 'sans-serif'],
        sans: ['Inter', 'Avenir', 'Helvetica', 'Arial', 'sans-serif']
      },
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'hsl(var(--border) / <alpha-value>)',
          strong: 'hsl(var(--border-strong) / <alpha-value>)',
        },
        ring: 'hsl(var(--ring) / <alpha-value>)',
      },
      boxShadow: {
        'neu-sm': '1px 1px 2px 0px rgba(0,0,0,0.06), -1px -1px 2px 0px rgba(255,255,255,0.6)',
        'neu-sm-hover': '1px 1px 3px 0px rgba(0,0,0,0.06), -1px -1px 3px 0px rgba(255,255,255,0.7)',
        'neu-sm-active': 'inset 1px 1px 2px 0px rgba(0,0,0,0.06), inset -1px -1px 2px 0px rgba(255,255,255,0.6)',
        'neu-raised': '2px 2px 4px 0px rgba(0,0,0,0.08), -2px -2px 4px 0px rgba(255,255,255,0.8)',
        'neu-raised-hover': '3px 3px 6px 0px rgba(0,0,0,0.08), -3px -3px 6px 0px rgba(255,255,255,0.8)',
        'neu-pressed': 'inset 2px 2px 4px 0px rgba(0,0,0,0.08), inset -2px -2px 4px 0px rgba(255,255,255,0.8)',
        'neu-pressed-hover': 'inset 3px 3px 6px 0px rgba(0,0,0,0.08), inset -3px -3px 6px 0px rgba(255,255,255,0.8)',
        'neu-pressed-active': 'inset 4px 4px 8px 0px rgba(0,0,0,0.12), inset -2px -2px 3px 0px rgba(255,255,255,0.6)',
        'neu-overlay': '4px 4px 8px 0px rgba(0,0,0,0.08), -4px -4px 8px 0px rgba(255,255,255,0.8)',
        'neu-modal': '8px 8px 16px 0px rgba(0,0,0,0.08), -8px -8px 16px 0px rgba(255,255,255,0.8)',
      }
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-(orange|blue|green|red|yellow|gray)-\d{3}/,
    }
  ],
  plugins: [],
}
