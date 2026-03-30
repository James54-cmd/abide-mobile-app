/** Aligned with FRONTEND.md — warm editorial devotional palette */
export const colors = {
  /** Screen background (warm parchment) */
  parchment: "#EDE8E0",
  ink: "#2C1F0E",
  gold: "#C9973A",
  muted: "#8C7B6A",
  teal: "#1D9E75",
  amber: "#EF9F27",
  /** Elevated cards / “today” sheet */
  cream: "#FAF7F2",
  /** Legacy alias — prefer `cream` for cards */
  creamLegacy: "#F5F0E8",
  /** Floating inputs: slightly lifted surface when focused */
  creamFocused: "#FDF8F1",
  /** Floating inputs: focus ring (gold @ ~55% alpha) */
  inputFocusBorder: "rgba(201, 151, 58, 0.55)",
  /** Validation / field error ring */
  inputErrorBorder: "#C53030",
  /** Hairlines / “or” divider on parchment */
  dividerMuted: "rgba(140, 123, 106, 0.2)",
  /** Inline auth / form error banner */
  errorBg: "rgba(185, 28, 28, 0.07)",
  white: "#FFFFFF",
  darkBg: "#1A1410",
  darkCard: "#231E18"
} as const;
