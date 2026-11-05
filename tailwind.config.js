/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Newsreader"', '"Merriweather"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FDFCF7',
          100: '#FAF8F0',
          200: '#F4EFE0',
          300: '#E8E1CC',
          800: '#1E1E1C',
          900: '#151514',
          950: '#0C0C0B',
        },
        zen: {
          amber: '#F59E0B',
          coral: '#F43F5E',
          teal: '#0D9488',
          indigo: '#6366F1',
          rose: '#E11D48',
          emerald: '#10B981',
          sky: '#0284C7',
          purple: '#8B5CF6',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}

