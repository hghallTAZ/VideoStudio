/**
 * SceneShell - Base wrapper for all scenes.
 *
 * Provides consistent dark background, optional grid overlay,
 * optional evidence tape accents, and centered content layout.
 */

import { AbsoluteFill } from "remotion";
import { colors, gridPattern, evidenceTape } from "./theme";

interface SceneShellProps {
  children: React.ReactNode;
  showGrid?: boolean;
  showTape?: boolean;
  tapePosition?: "top" | "bottom" | "both";
  justify?: "center" | "flex-start" | "flex-end" | "space-between";
  padding?: number;
}

export function SceneShell({
  children,
  showGrid = true,
  showTape = false,
  tapePosition = "both",
  justify = "center",
  padding = 80,
}: SceneShellProps) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: justify,
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding,
      }}
    >
      {showGrid && <div style={gridPattern()} />}

      {showTape && (tapePosition === "top" || tapePosition === "both") && (
        <div
          style={{
            position: "absolute",
            top: padding,
            left: 0,
            right: 0,
            ...evidenceTape(),
          }}
        />
      )}

      {children}

      {showTape && (tapePosition === "bottom" || tapePosition === "both") && (
        <div
          style={{
            position: "absolute",
            bottom: padding,
            left: 0,
            right: 0,
            ...evidenceTape(),
          }}
        />
      )}
    </AbsoluteFill>
  );
}
