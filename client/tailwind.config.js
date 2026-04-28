/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0F1629",
          800: "#1A2235",
          700: "#2A344A",
        },
        coral: {
          500: "#FF8E53",
          600: "#FF6B35",
        }
      },
      backgroundImage: {
        'gradient-coral': 'linear-gradient(to right, #FF6B35, #FF8E53)',
      }
    },
  },
  plugins: [],
};
