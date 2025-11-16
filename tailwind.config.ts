import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEF9',
          100: '#FFF9E6',
          200: '#FFF4CC',
          300: '#FFEFB3',
          400: '#FFE999',
          500: '#FFE480',
          600: '#FFDF66',
          700: '#FFDA4D',
          800: '#FFD533',
          900: '#FFD01A',
        },
        warm: {
          orange: '#FF9966',
          peach: '#FFCC99',
          pink: '#FFB3BA',
        },
      },
      fontFamily: {
        handwriting: ['"Noto Sans JP"', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "url('/textures/paper.png')",
      },
    },
  },
  plugins: [],
};

export default config;
