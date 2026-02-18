/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
          display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        },
        colors: {
          travel: {
            primary: '#059669',
            primaryLight: '#10b981',
            sky: '#0EA5E9',
            ocean: '#06B6D4',
            sand: '#d1fae5',
            cream: '#ecfdf5',
          },
          primary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
          },
          accent: {
            amber: '#F59E0B',
            orange: '#EA580C',
            sky: '#0EA5E9',
            teal: '#06B6D4',
            purple: '#A06CD5',
            pink: '#EC4899',
          }
        },
        spacing: {
          'safe-top': 'env(safe-area-inset-top)',
          'safe-bottom': 'env(safe-area-inset-bottom)',
          'safe-left': 'env(safe-area-inset-left)',
          'safe-right': 'env(safe-area-inset-right)',
        },
        maxWidth: {
          'app': '480px',
          'content': '1200px',
        },
        borderRadius: {
          'travel': '1rem',
          'travel-lg': '1.25rem',
        },
        boxShadow: {
          'travel': '0 4px 20px rgba(5, 150, 105, 0.12)',
          'travel-lg': '0 8px 32px rgba(5, 150, 105, 0.15)',
          'card': '0 2px 12px rgba(0,0,0,0.06)',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
          'slideInLeft': 'slideInLeft 0.8s ease-out forwards',
          'slideInRight': 'slideInRight 0.8s ease-out forwards',
          'glow': 'glow 2s ease-in-out infinite',
          'pulse': 'pulse 2s ease-in-out infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(5deg)' },
          },
          fadeInUp: {
            from: {
              opacity: '0',
              transform: 'translateY(30px)',
            },
            to: {
              opacity: '1',
              transform: 'translateY(0)',
            },
          },
          slideInLeft: {
            from: {
              opacity: '0',
              transform: 'translateX(-50px)',
            },
            to: {
              opacity: '1',
              transform: 'translateX(0)',
            },
          },
          slideInRight: {
            from: {
              opacity: '0',
              transform: 'translateX(50px)',
            },
            to: {
              opacity: '1',
              transform: 'translateX(0)',
            },
          },
          glow: {
            '0%, 100%': { boxShadow: '0 0 20px rgba(78, 237, 196, 0.3)' },
            '50%': { boxShadow: '0 0 40px rgba(78, 237, 196, 0.6), 0 0 60px rgba(78, 237, 196, 0.3)' },
          },
          pulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
        },
      },
    },
    plugins: [],
  }