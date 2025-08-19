module.exports = {
  darkMode: "class", // enables light/dark toggle
  theme: {
    extend: {
      colors: {
        primary: {
          navy: "#0F172A",
          blue: "#2563EB",
        },
        secondary: {
          teal: "#14B8A6",
          purple: "#7C3AED",
        },
        neutral: {
          light: "#F9FAFB",
          warm: "#6B7280",
        },
      },
      fontFamily: {
        heading: ["Inter", "Segoe UI", "SF Pro", "sans-serif"],
        body: ["Inter", "Segoe UI", "SF Pro", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)",
        glow: "0 0 8px rgba(20,184,166,0.6)", // teal glow for AI fields
      },
    },
  },
}
