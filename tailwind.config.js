/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Nunito', 'sans-serif'],
        sans: ['Inter', 'Avenir', 'Helvetica', 'Arial', 'sans-serif']
      },
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-(orange|blue|green|red|yellow)-\d{3}/,
    }
  ],
  plugins: [],
}

