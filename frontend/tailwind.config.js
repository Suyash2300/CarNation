/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Aliases to keep existing CSS utilities working
        primary: {
          50: "#e9f5ff",
          100: "#d2ebff",
          200: "#a6d7ff",
          300: "#73bfff",
          400: "#3ba6ff",
          500: "#008cff",
          600: "#0075d1",
          700: "#005fa6",
          800: "#004a82",
          900: "#002f54",
        },
        secondary: {
          50: "#fff9eb",
          100: "#fef2c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#0b0f19",
        },
        brand: {
          50: "#e9f5ff",
          100: "#d2ebff",
          200: "#a6d7ff",
          300: "#73bfff",
          400: "#3ba6ff",
          500: "#008cff", // modern bright blue
          600: "#0075d1",
          700: "#005fa6",
          800: "#004a82",
          900: "#002f54",
        },

        gold: {
          50: "#fff9eb",
          100: "#fef2c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        slate: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#0b0f19",
        },

        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },

        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",

        background: {
          light: "#f9fafb",
          dark: "#0b0f19",
          card: "#101827",
          accent: "#141b2b",
        },
      },

      fontFamily: {
        heading: ["Poppins", "Inter", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },

      boxShadow: {
        soft: "0 4px 10px rgba(0,0,0,0.05)",
        card: "0 10px 30px rgba(0,0,0,0.08)",
        glow: "0 0 30px rgba(0,140,255,0.3)",
      },

      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #008cff 0%, #005fa6 100%)",
        "gradient-primary": "linear-gradient(135deg, #008cff 0%, #005fa6 100%)",
        "gradient-luxury": "linear-gradient(135deg, #0b0f19 0%, #1f2937 100%)",
        "gradient-gold": "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      },

      transitionTimingFunction: {
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      animation: {
        fade: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 0.6s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
