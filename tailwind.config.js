module.exports = {
  content: [
    "./atoms/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Ariel", "sans-serif"],
    },
    extend: {
      colors: {
        "background-white": "#f8f7f6",
        "brand-white": "#FCFCFC",
        "brand-blue": "#012F7C",
        "brand-green": "#48A9A6",
        "brand-black": "#494953",
        "brand-red": "#C1666B",
        "brand-yellow": "#F2BC41",
      },
    },
  },
  plugins: [],
};
