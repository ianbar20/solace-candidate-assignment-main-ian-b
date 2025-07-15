import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mollie: ["'Mollie Glaston'", "cursive"],
      },
      borderRadius: {
        'custom': '10px',
      },
      colors: {
        primary: {
          bg: "#265b4e", 
          text: "#285e50", 
          accent: "#3a7b6e", 
        },
        light: "#f5f5f5",
        border: "#dddddd",
      },
    },
  },
  plugins: [],
};
export default config;
