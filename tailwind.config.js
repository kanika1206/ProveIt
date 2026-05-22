/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#ffffff',
          dark:    '#f9fafb',
          darker:  '#f3f4f6',
        },
        paper: {
          DEFAULT: '#ffffff',
          dark:    '#f9fafb',
        },
        ink: {
          DEFAULT: '#0f172a',
          2:       '#1e293b',
          3:       '#334155',
        },
        accent: {
          DEFAULT: '#0d9e78',
          hover:   '#0b8a69',
          dim:     '#34d399',
          light:   '#e6f8f2',
          glow:    'rgba(13,158,120,0.12)',
        },
        olive: {
          DEFAULT: '#1e293b',
          light:   '#334155',
          glow:    'rgba(30,41,59,0.12)',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark:    '#cbd5e1',
          light:   '#f1f5f9',
        },
        text: {
          primary:   '#0f172a',
          secondary: '#64748b',
          muted:     '#94a3b8',
        },
        status: {
          success: '#0d9e78',
          warning: '#f59e0b',
          danger:  '#ef4444',
          info:    '#3b82f6',
        },
      },

      fontFamily: {
        serif: ['Inter', 'system-ui', 'sans-serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['Space Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.0',  letterSpacing: '-0.03em', fontWeight: '900' }],
        'display-xl':  ['56px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-lg':  ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md':  ['36px', { lineHeight: '1.08', letterSpacing: '-0.015em', fontWeight: '800' }],
        'display-sm':  ['28px', { lineHeight: '1.1',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'label-lg':    ['12px', { lineHeight: '1.4',  letterSpacing: '0.08em' }],
        'label-sm':    ['10px', { lineHeight: '1.4',  letterSpacing: '0.1em' }],
      },

      borderRadius: {
        none:    '0px',
        sm:      '4px',
        DEFAULT: '6px',
        md:      '8px',
        lg:      '10px',
        xl:      '12px',
        '2xl':   '16px',
        pill:    '100px',
        full:    '9999px',
      },

      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':   '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        'card-lg':   '0 8px 32px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
        'accent-sm': '0 4px 12px rgba(13,158,120,0.20)',
        'accent':    '0 4px 20px rgba(13,158,120,0.28)',
        'accent-lg': '0 8px 32px rgba(13,158,120,0.32)',
        'stamp-sm':  '2px 2px 0 #e2e8f0, 4px 4px 0 #f1f5f9',
        'stamp':     '3px 3px 0 #e2e8f0, 6px 6px 0 #f1f5f9',
        none:        'none',
      },

      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'bar-grow': {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },

      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in':    'fade-in 0.3s ease-out forwards',
        'pulse-dot':  'pulse-dot 1.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'bar-grow':   'bar-grow 0.6s ease-out forwards',
      },

      screens: {
        xs:    '480px',
        sm:    '640px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1536px',
      },
    },
  },

  plugins: [
    function ({ addUtilities, theme }) {
      addUtilities({
        '.text-editorial-2xl': {
          fontFamily:    theme('fontFamily.sans').join(', '),
          fontSize:      '72px',
          fontWeight:    '900',
          lineHeight:    '1.0',
          letterSpacing: '-0.03em',
          color:         theme('colors.ink.DEFAULT'),
        },
        '.text-editorial-xl': {
          fontFamily:    theme('fontFamily.sans').join(', '),
          fontSize:      '56px',
          fontWeight:    '900',
          lineHeight:    '1.02',
          letterSpacing: '-0.02em',
          color:         theme('colors.ink.DEFAULT'),
        },
        '.text-label': {
          fontFamily:    theme('fontFamily.mono').join(', '),
          fontSize:      '10px',
          fontWeight:    '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         theme('colors.text.muted'),
        },
        '.btn-pill': {
          borderRadius: '100px',
          paddingLeft:  '24px',
          paddingRight: '24px',
        },
      });
    },
  ],
};
