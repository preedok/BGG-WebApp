/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        fontFamily: {
          playfair: ['"Playfair Display"', 'serif'],
          sans: ['"DM Sans"', 'sans-serif'],
        },
        colors: {
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          accent: {
            amber: '#FFB84D',
            orange: '#FF8C42',
            purple: '#A06CD5',
            pink: '#FF6B9D',
            cyan: '#4ECDC4',
            blue: '#6B8EFF',
          }
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