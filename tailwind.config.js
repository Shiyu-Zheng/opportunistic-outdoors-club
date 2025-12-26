/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './zh/**/*.html',
    './about/**/*.html',
    './faq/**/*.html',
    './templates/**/*.html',
    './partials/**/*.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
