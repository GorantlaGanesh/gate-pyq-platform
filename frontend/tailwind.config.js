/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151922",        // near-black, slightly blue — body text
        parchment: "#F6F3EC",  // warm off-white background
        slate: "#3D4457",      // secondary text / borders
        brass: "#B08D57",      // accent — worn brass, ledger/exam-hall feel
        correct: "#2F6E4C",
        incorrect: "#A23B3B",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
