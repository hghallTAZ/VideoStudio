/**
 * ECA Video Design Tokens
 *
 * Matches the "Forensic Precision" aesthetic from the app.
 * Single source of truth for all video styling.
 */

export const colors = {
  bg: "#0a0a0a",
  bgCard: "#141414",
  bgCardHover: "#1a1a1a",
  foreground: "#e5e5e5",
  muted: "#737373",
  mutedLight: "#a3a3a3",
  primary: "#3b82f6",
  primaryDim: "#2563eb",
  amber: "#f59e0b",
  amberDim: "#d97706",
  border: "#262626",
  borderLight: "#333333",
  destructive: "#ef4444",
  success: "#22c55e",
} as const;

export const fonts = {
  heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
  body: "system-ui, -apple-system, sans-serif",
} as const;

/** Evidence tape stripe pattern (CSS background) */
export function evidenceTape(opacity = 0.4): React.CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(90deg, ${colors.amber} 0px, ${colors.amber} 20px, transparent 20px, transparent 30px)`,
    opacity,
    height: 2,
  };
}

/** Grid pattern overlay */
export function gridPattern(opacity = 0.08): React.CSSProperties {
  return {
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `linear-gradient(${colors.muted}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 1px, transparent 1px), linear-gradient(90deg, ${colors.muted}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
  };
}
