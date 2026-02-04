tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
                cine: ['Syne', 'sans-serif'],
            },
            colors: {
                bg: '#030303',
                surface: '#0F0F0F',
                accent: '#EBEBEB',
                glass: 'rgba(255, 255, 255, 0.05)',
            },
            animation: {
                'slow-spin': 'spin 15s linear infinite',
                'marquee': 'marquee 30s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' }
                }
            },
            cursor: {
                'none': 'none',
            }
        }
    }
}
