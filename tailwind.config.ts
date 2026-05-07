import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fcc: {
          background: 'rgb(var(--color-background) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          panel: 'rgb(var(--color-panel) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
          muted: 'rgb(var(--color-muted) / <alpha-value>)',
          highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
          success: 'rgb(var(--color-success) / <alpha-value>)',
          danger: 'rgb(var(--color-danger) / <alpha-value>)',
          cta: 'rgb(var(--color-cta) / <alpha-value>)',
          focus: 'rgb(var(--color-focus) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Hack-ZeroSlash', 'Fira Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      screens: {
        xs: '500px',
      },
    },
  },
  plugins: [],
} satisfies Config;
