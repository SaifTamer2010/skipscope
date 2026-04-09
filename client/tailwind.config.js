/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "var(--color-brand-red)",
          "red-strong": "var(--color-brand-red-strong)",
          "red-dark": "var(--color-brand-red-dark)",
        },
        background: {
          main: "var(--color-background-main)",
          secondry: "var(--color-background-secondry)",
          third: "var(--color-background-third)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondry: "var(--color-text-secondry)",
        },
        border: {
          muted: "var(--color-border-muted)",
          light: "var(--color-border-light)",
        },
      },
      boxShadow: {
        "brand-glow": "0 0 20px var(--color-brand-glow)",
        "brand-glow-strong": "0 0 30px var(--color-brand-glow-strong)",
      },
    },
  },
  plugins: [],
};
