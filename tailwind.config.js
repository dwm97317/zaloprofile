module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}", "./index.html"],
  theme: {
    extend: {
      // LINE 主题色
      colors: {
        primary: {
          DEFAULT: '#00B900',
          light: '#00E600',
          dark: '#009900',
          50: '#E6F9E6',
          100: '#CCF3CC',
          200: '#99E699',
          300: '#66D966',
          400: '#33CC33',
          500: '#00B900',
          600: '#009900',
          700: '#007300',
          800: '#004D00',
          900: '#002600',
        },
        secondary: {
          orange: '#FF6B35',
          pink: '#FF006E',
          purple: '#8338EC',
          yellow: '#FFD60A',
          blue: '#00B4D8',
        },
      },
      
      // 圆角系统（LINE 风格 - 圆润）
      borderRadius: {
        'none': '0',
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
        'full': '9999px',
      },
      
      // 字体系统（泰语优化）
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      
      // 字体家族
      fontFamily: {
        'sans': ['Noto Sans Thai', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      // 动画配置
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-in-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // 阴影系统
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'green': '0 10px 25px -5px rgba(0, 185, 0, 0.3)',
        'orange': '0 10px 25px -5px rgba(255, 107, 53, 0.3)',
        'pink': '0 10px 25px -5px rgba(255, 0, 110, 0.3)',
      },
    },
  },
  plugins: [],
};

