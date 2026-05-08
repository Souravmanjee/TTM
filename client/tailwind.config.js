/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E1D4C1', // Beige
          light: '#ece3d6',
          dark: '#c9bba6',
        },
        secondary: {
          DEFAULT: '#7E102C', // Crimson
          light: '#a12541',
          dark: '#5c0b20',
        },
        accent: {
          DEFAULT: '#D7A9A8', // Soft Pink
          light: '#e5c4c3',
          dark: '#c48e8d',
        },
        surface: {
          DEFAULT: '#020617', // Deep Slate
          light: '#0f172a',  
          lighter: '#1e293b', 
        },
        border: '#1e293b',
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 0 50px -12px rgba(225, 212, 193, 0.15)',
        'premium-hover': '0 0 60px -10px rgba(225, 212, 193, 0.25)',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #E1D4C1 0%, #7E102C 100%)',
      }
    },
  },
  plugins: [],
}
