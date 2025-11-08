/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'background': '#F4F3EE',
        'text-dark': '#463F3A',
        'text-light': '#8A817C',
        'primary': '#BCB8B1',
        'accent': '#E0AFA0',
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