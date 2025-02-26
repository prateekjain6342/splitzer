/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primaryDarkBlue: "#080F17",
			secondaryGreen: "#A7EE43",
			themeWhite: "#D6DDE6"
  		},
		fontFamily: {
			plusjakarta: ['var(--font-plusjakarta)']
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
