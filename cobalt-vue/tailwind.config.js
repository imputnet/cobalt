/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 深色主题基础色
        dark: {
          900: '#0A0A0B',
          800: '#1A1A1B',
          700: '#2A2A2B',
          600: '#3A3A3B',
          500: '#4A4A4B',
        },
        // 霓虹色彩
        neon: {
          red: '#FF3366',
          blue: '#3366FF',
          green: '#33FF66',
          purple: '#6633FF',
          pink: '#FF33CC',
        },
        // 玻璃形态色彩
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.3)',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgb(255 51 102 / 0.5), 0 0 10px rgb(255 51 102 / 0.3)' 
          },
          '100%': { 
            boxShadow: '0 0 20px rgb(255 51 102 / 0.8), 0 0 30px rgb(255 51 102 / 0.4)' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
    },
  },
  plugins: [],
} 