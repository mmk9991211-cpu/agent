/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0C0F',
          900: '#101216',
          850: '#14171C',
          800: '#181C22',
          750: '#1E232B',
          700: '#262C36',
          600: '#333B48',
        },
        sand: {
          50: '#FBF8F3',
          100: '#F3EDE2',
          200: '#E4D8C4',
          300: '#CFBB9C',
          400: '#B79A72',
          500: '#A07F55',
          600: '#8A6A43',
        },
        amber: {
          300: '#F3C088',
          400: '#E8A15F',
          500: '#D9822B',
          600: '#C56F2C',
        },
        mint: { 400: '#5FCFA0', 500: '#3BB183' },
        sky: { 400: '#6BA6F5', 500: '#4A8CE8' },
        rose: { 400: '#F0718D', 500: '#DB5A78' },
      },
      fontFamily: {
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { xl2: '18px' },
      boxShadow: {
        soft: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(217,130,43,0.28), 0 16px 40px -18px rgba(217,130,43,0.45)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slidein: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        rise: 'rise .36s cubic-bezier(.22,.8,.3,1) both',
        fade: 'fade .3s ease both',
        slidein: 'slidein .32s cubic-bezier(.22,.8,.3,1) both',
      },
    },
  },
  plugins: [],
}
