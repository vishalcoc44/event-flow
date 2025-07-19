/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6CDAEC", // Updated to match design system
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5", // Updated to match design system
          foreground: "#1D1D1D",
        },
        destructive: {
          DEFAULT: "#E74C3C", // Red from the design
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F0F0F0", // Updated to match design system
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#E8E8E8", // Updated to match design system
          foreground: "#1D1D1D",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1D1D1D",
        },
        // EventFlow design system colors
        eventflow: {
          background: "#FFFFFF",
          foreground: "#1D1D1D",
          primary: "#6CDAEC",
          primaryAccent: "#5BCFE3",
          secondary: "#F5F5F5",
          muted: "#F0F0F0",
          accent: "#E8E8E8",
          card: "#FFFFFF",
          border: "#E5E5E5",
          input: "#F8F8F8",
          destructive: "#E74C3C"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "move": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "move": "move 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

