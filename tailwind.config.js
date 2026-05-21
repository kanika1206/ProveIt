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

      //  Colors 
      colors: {
        cream: {
          DEFAULT: '#F5F0E8',
          dark:    '#EDE8DC',
          darker:  '#E0D9CC',
        },
        paper: {
          DEFAULT: '#FDFAF4',
          dark:    '#F7F3EA',
        },
        ink: {
          DEFAULT: '#1A1208',
          2:       '#2C2010',
          3:       '#3D3018',
        },
        accent: {
          DEFAULT: '#C84B2F',
          hover:   '#B03D24',
          dim:     '#E86448',
          light:   '#FDEEE9',
          glow:    'rgba(200, 75, 47, 0.12)',
        },
        olive: {
          DEFAULT: '#2D3B1F',
          light:   '#4A5E33',
          glow:    'rgba(45, 59, 31, 0.12)',
        },
        border: {
          DEFAULT: '#D4CBBA',
          dark:    '#B8AE9C',
          light:   '#E8E2D6',
        },
        text: {
          primary:   '#1A1208',
          secondary: '#5C4F38',
          muted:     '#9C8E78',
        },
        // Status
        status: {
          success: '#2D6A2D',
          warning: '#C17D10',
          danger:  '#C84B2F',
          info:    '#2D5A8E',
        },
      },

      // Typography
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['Space Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        // Editorial large display sizes
        'display-2xl': ['72px', { lineHeight: '1.0',  letterSpacing: '-0.03em', fontWeight: '900' }],
        'display-xl':  ['56px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-lg':  ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md':  ['36px', { lineHeight: '1.08', letterSpacing: '-0.015em', fontWeight: '800' }],
        'display-sm':  ['28px', { lineHeight: '1.1',  letterSpacing: '-0.01em', fontWeight: '700' }],
        // Label / mono sizes
        'label-lg':    ['12px', { lineHeight: '1.4',  letterSpacing: '0.12em' }],
        'label-sm':    ['10px', { lineHeight: '1.4',  letterSpacing: '0.15em' }],
      },

      fontWeight: {
        black: '900',
      },

      lineHeight: {
        editorial: '1.05',
        tight:     '1.15',
        snug:      '1.3',
      },

      letterSpacing: {
        tightest: '-0.03em',
        tighter:  '-0.02em',
        wide:     '0.08em',
        wider:    '0.12em',
        widest:   '0.18em',
      },

      //  Spacing 
      spacing: {
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
        '26':  '104px',
        '30':  '120px',
        '34':  '136px',
        '38':  '152px',
        '42':  '168px',
        '128': '512px',
        '144': '576px',
      },

      //  Border Radius
      borderRadius: {
        none:   '0px',
        sm:     '2px',
        DEFAULT:'4px',
        md:     '6px',
        lg:     '8px',
        xl:     '12px',
        '2xl':  '16px',
        pill:   '100px',
        full:   '9999px',
      },

      // Box Shadow
      boxShadow: {
        // Stamp / paper layered shadows
        'stamp-sm': '2px 2px 0 #B8AE9C, 4px 4px 0 #E0D9CC',
        'stamp':    '3px 3px 0 #B8AE9C, 6px 6px 0 #E0D9CC',
        'stamp-lg': '4px 4px 0 #B8AE9C, 8px 8px 0 #E0D9CC',
        // Soft paper elevation
        'paper-sm': '0 1px 4px rgba(26,18,8,0.06), 0 1px 2px rgba(26,18,8,0.04)',
        'paper':    '0 4px 16px rgba(26,18,8,0.07), 0 2px 6px rgba(26,18,8,0.04)',
        'paper-lg': '0 8px 32px rgba(26,18,8,0.09), 0 4px 12px rgba(26,18,8,0.05)',
        // Accent glow
        'accent-sm':'0 4px 12px rgba(200,75,47,0.20)',
        'accent':   '0 4px 20px rgba(200,75,47,0.28)',
        'accent-lg':'0 8px 32px rgba(200,75,47,0.32)',
        // Olive glow
        'olive':    '0 4px 16px rgba(45,59,31,0.18)',
        // Inset border highlight
        'inset-top':'inset 0 1px 0 rgba(255,255,255,0.6)',
        // None
        none:       'none',
      },

      //  Border Width
      borderWidth: {
        DEFAULT: '1px',
        '1.5':   '1.5px',
        '2':     '2px',
        '3':     '3px',
      },

      // Background Image 
      backgroundImage: {
        // Subtle ruled lines like notebook paper
        'ruled': `repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 31px,
          #D4CBBA 31px,
          #D4CBBA 32px
        )`,
        // Fine dot grid
        'dot-grid': `radial-gradient(circle, #B8AE9C 1px, transparent 1px)`,
        // Diagonal hatch
        'hatch': `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 4px,
          rgba(180,170,155,0.3) 4px,
          rgba(180,170,155,0.3) 5px
        )`,
        // Accent gradient
        'accent-gradient': 'linear-gradient(135deg, #C84B2F 0%, #E86448 100%)',
        // Olive gradient
        'olive-gradient':  'linear-gradient(135deg, #2D3B1F 0%, #4A5E33 100%)',
        // Paper gradient (top light)
        'paper-gradient':  'linear-gradient(180deg, #FDFAF4 0%, #F5F0E8 100%)',
      },

      backgroundSize: {
        'dot-grid': '24px 24px',
      },

      //  Opacity 
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },

      //  Animation 
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'stamp-in': {
          '0%':   { opacity: '0', transform: 'scale(1.08) rotate(-1deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'chain-append': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bar-grow': {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },

      animation: {
        'fade-in-up':     'fade-in-up 0.5s ease-out forwards',
        'fade-in':        'fade-in 0.3s ease-out forwards',
        'stamp-in':       'stamp-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'pulse-dot':      'pulse-dot 1.5s ease-in-out infinite',
        'shimmer':        'shimmer 1.5s infinite',
        'chain-append':   'chain-append 0.4s ease-out',
        'bar-grow':       'bar-grow 0.6s ease-out forwards',
      },

      //  Transition 
      transitionDuration: {
        '0':   '0ms',
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },

      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth':     'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      //  Screens (breakpoints — unchanged) 
      screens: {
        xs:  '480px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },

      //  Z-index 
      zIndex: {
        '1':    '1',
        '60':   '60',
        '70':   '70',
        '80':   '80',
        '90':   '90',
        '100':  '100',
        'toast':'1000',
      },
    },
  },

  plugins: [
    // Adds a `font-serif` variant utility automatically
    function ({ addUtilities, theme }) {
      addUtilities({

        // ── Editorial heading helpers ──
        '.text-editorial-2xl': {
          fontFamily:    theme('fontFamily.serif').join(', '),
          fontSize:      '72px',
          fontWeight:    '900',
          lineHeight:    '1.0',
          letterSpacing: '-0.03em',
          color:         theme('colors.ink.DEFAULT'),
        },
        '.text-editorial-xl': {
          fontFamily:    theme('fontFamily.serif').join(', '),
          fontSize:      '56px',
          fontWeight:    '900',
          lineHeight:    '1.02',
          letterSpacing: '-0.02em',
          color:         theme('colors.ink.DEFAULT'),
        },
        '.text-editorial-lg': {
          fontFamily:    theme('fontFamily.serif').join(', '),
          fontSize:      '44px',
          fontWeight:    '800',
          lineHeight:    '1.05',
          letterSpacing: '-0.02em',
          color:         theme('colors.ink.DEFAULT'),
        },

        // ── Section label (mono, all-caps, wide tracking) ──
        '.text-label': {
          fontFamily:    theme('fontFamily.mono').join(', '),
          fontSize:      '10px',
          fontWeight:    '700',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         theme('colors.text.muted'),
        },

        // ── Dashed border utility ──
        '.border-dashed-ink': {
          border:       '1.5px dashed #B8AE9C',
          borderRadius: '4px',
        },

        // ── Stamp shadow utility ──
        '.shadow-stamp': {
          boxShadow: '3px 3px 0 #B8AE9C, 6px 6px 0 #E0D9CC',
        },

        // ── Accent italic text (for heading accents) ──
        '.text-accent-italic': {
          color:      theme('colors.accent.DEFAULT'),
          fontStyle:  'italic',
        },

        // ── Pill button base ──
        '.btn-pill': {
          borderRadius: '100px',
          paddingLeft:  '24px',
          paddingRight: '24px',
        },
      })
    },
  ],
}
