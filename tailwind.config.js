// tailwind.config.js
// Bartô v2.1 — tokens de design completos

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // ── Paleta de cores ───────────────────────────────────────────────────
      colors: {
        // Dourado — identidade da marca
        gold: {
          DEFAULT: "#C9A84C",
          light:   "#E2C97E",
          bright:  "#D4AE52",
          dark:    "#9A7A2E",
          deep:    "#8A6A22",
          muted:   "#C9A84C18",
          border:  "#C9A84C30",
        },
        // Laranja — ação e interação
        ember: {
          DEFAULT: "#F97316",
          light:   "#FB923C",
          dark:    "#EA580C",
          muted:   "#F9731614",
          border:  "#F9731628",
        },
        // Base preta — fundos
        ink: {
          950: "#080808",   // fundo principal
          900: "#0A0A0A",   // sidebar / header
          800: "#0F0F0F",   // cards
          700: "#141414",   // hover de card, inputs
          600: "#161616",   // elevated hover
          500: "#1A1A1A",   // divisores
          400: "#1E1E1E",   // bordas sutis
          300: "#252525",   // bordas de input
          200: "#2A2A2A",   // bordas hover
          150: "#333333",   // bordas ativas
          100: "#444444",   // texto muito muted
          50:  "#666666",   // texto muted
        },
        // Texto
        cream: {
          DEFAULT: "#E8E4DC",
          bright:  "#EDE9DF",
          muted:   "#C8C4BC",
          dim:     "#D4D0C8",
        },
      },

      // ── Tipografia ────────────────────────────────────────────────────────
      fontFamily: {
        display: ["'Syne'",    "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],   // 10px
        "xs":  ["0.6875rem", { lineHeight: "1rem" }],  // 11px
        "sm":  ["0.8125rem", { lineHeight: "1.25rem" }], // 13px
      },

      letterSpacing: {
        "tightest": "-0.05em",
        "tighter":  "-0.03em",
        "tight":    "-0.02em",
        "widest":   "0.12em",
        "wider":    "0.08em",
        "caps":     "0.14em",
      },

      // ── Bordas e sombras ──────────────────────────────────────────────────
      borderRadius: {
        "2xs": "3px",
        "xs":  "4px",
        "sm":  "6px",
        "md":  "8px",
        "lg":  "10px",
        "xl":  "12px",
        "2xl": "16px",
      },

      boxShadow: {
        "gold-sm":  "0 0 0 1px #C9A84C25, 0 2px 8px #C9A84C10",
        "gold-md":  "0 0 0 1px #C9A84C30, 0 8px 32px #C9A84C12",
        "ember-sm": "0 0 0 1px #F9731625, 0 2px 8px #F9731610",
        "card":     "0 4px 24px #00000050",
        "card-hover": "0 8px 40px #00000070",
        "modal":    "0 0 0 1px #C9A84C10, 0 32px 80px #00000096",
      },

      // ── Transições ────────────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "smooth":     "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-back":    "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "out-quart":  "cubic-bezier(0.25, 1, 0.5, 1)",
      },

      transitionDuration: {
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "280": "280ms",
      },

      // ── Animações ─────────────────────────────────────────────────────────
      animation: {
        "fade-in":    "barto-fade-in 0.2s ease both",
        "slide-up":   "barto-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in":   "barto-scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-gold": "barto-pulse-gold 2s infinite",
        "pulse-red":  "barto-pulse-red 2s infinite",
        "shimmer":    "barto-shimmer 1.4s ease infinite",
      },

      // ── Sidebar ───────────────────────────────────────────────────────────
      width: {
        "sidebar":          "228px",
        "sidebar-collapsed": "60px",
      },
    },
  },
  plugins: [],
};