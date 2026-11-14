/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080F0C',
          secondary: '#101B15',
        },
        forest: '#14532D',
        emerald: {
          DEFAULT: '#10B981',
          bright: '#34D399',
        },
        text: {
          primary: '#F0FDF4',
          secondary: '#9CA3AF',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'green-glow': 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
        'card-glass': 'linear-gradient(135deg, rgba(16,27,21,0.8) 0%, rgba(8,15,12,0.9) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(52,211,153,0.1)',
        'glass-hover': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.2)',
        'emerald-glow': '0 0 20px rgba(16,185,129,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
