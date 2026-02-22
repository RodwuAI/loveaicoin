/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2D6B',
          dark: '#0F1A45',
        },
        gold: {
          DEFAULT: '#C5975B',
          light: '#D4B88C',
          pale: '#F5EDE0',
        },
        surface: '#F8F9FC',
        'bg-surface': '#F1F3F8',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(27,45,107,0.04)',
        'card-hover': '0 4px 16px rgba(27,45,107,0.06)',
        'card-lg': '0 8px 32px rgba(27,45,107,0.08)',
        'card-xl': '0 16px 48px rgba(27,45,107,0.10)',
        'gold': '0 4px 12px rgba(197,151,91,0.25)',
        'gold-hover': '0 8px 24px rgba(197,151,91,0.35)',
      },
    },
  },
  plugins: [],
};
