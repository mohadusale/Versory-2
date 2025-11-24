/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'background': 'var(--color-background)',
        'text-dark': 'var(--color-text-dark)',
        'text-light': 'var(--color-text-light)',
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
      },
      fontFamily: {
        'lora': ['Lora_600SemiBold'],
        'montserrat': ['Montserrat_400Regular'],
        'montserrat-medium': ['Montserrat_500Medium'],
        'montserrat-bold': ['Montserrat_700Bold'],
      },
    },
  },
  plugins: [],
}