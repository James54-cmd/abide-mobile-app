/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        parchment: "#EDE8E0",
        ink: "#2C1F0E",
        gold: "#C9973A",
        muted: "#8C7B6A",
        teal: "#1D9E75",
        amber: "#EF9F27",
        cream: "#FAF7F2",
        "dark-bg": "#1A1410",
        "dark-card": "#231E18"
      },
      fontFamily: {
        serif: ["Lora-Regular"],
        "serif-italic": ["Lora-Italic"],
        sans: ["DMSans-Regular"],
        "sans-medium": ["DMSans-Medium"]
      }
    }
  },
  plugins: []
};
