import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './stores/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1600px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Cosmos-specific source colors
        nebula: {
          violet: '#7C3AED',
          cyan: '#22D3EE',
          magenta: '#EC4899',
        },
        source: {
          apod: '#7C3AED',
          mars: '#F97316',
          neo: '#EF4444',
          epic: '#22D3EE',
          library: '#34D399',
          techtransfer: '#F59E0B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'aurora': 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 50%, #EC4899 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7C3AED, #4F46E5)',
        'gradient-cyan': 'linear-gradient(135deg, #22D3EE, #3B82F6)',
        'gradient-magenta': 'linear-gradient(135deg, #EC4899, #7C3AED)',
      },
      keyframes: {
        'aurora-shift': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) rotate(120deg) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg) scale(0.95)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'border-rotate': {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' },
        },
      },
      animation: {
        'aurora-shift': 'aurora-shift 20s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
