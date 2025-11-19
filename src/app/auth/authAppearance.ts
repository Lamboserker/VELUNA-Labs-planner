export const authAppearance = {
  variables: {
    colorPrimary: "#22d3ee",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#cbd5f5",
    colorBorder: "rgba(148, 163, 184, 0.25)",
    colorCardBackground: "#020617",
    colorBackground: "#020617",
    colorInput: "#0f172a",
    colorInputForeground: "#f8fafc",
    colorInputBackground: "#050b1a",
    colorRing: "#22d3ee",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "32px",
    spacing: "1rem",
  },
  layout: {
    logoPlacement: "none",
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
  },
  elements: {
    card: {
      // border: "1px solid rgba(148, 163, 184, 0.25)",
      backgroundColor: "#030712",
      boxShadow: "0 30px 70px rgba(2, 6, 23, 0.8)",
      borderRadius: "32px",
    },
    socialButtons: {
      gap: "0.75rem",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#0ea5e9",
      // border: '1px solid transparent',
      boxShadow: "0 15px 30px rgba(14, 165, 233, 0.35)",
    },
    socialButtonsBlockButtonText: {
      color: "#fff",
    },
    formButtonPrimary: {
      borderRadius: "999px",
      boxShadow: "0 18px 35px rgba(14, 165, 233, 0.35)",
    },
  },
};
