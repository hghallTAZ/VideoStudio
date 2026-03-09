/**
 * MetricCard - Animated stat card with spring entrance.
 */

import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors, fonts } from "./theme";

interface MetricCardProps {
  value: string;
  label: string;
  /** Frame delay for stagger entrance */
  delay?: number;
  width?: number;
  valueColor?: string;
}

export function MetricCard({
  value,
  label,
  delay = 0,
  width = 220,
  valueColor = colors.primary,
}: MetricCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.max(0, scale)})`,
        textAlign: "center" as const,
        padding: "40px 30px",
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        backgroundColor: colors.bgCard,
        minWidth: width,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: valueColor,
          marginBottom: 12,
          fontFamily: fonts.mono,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: colors.muted,
          textTransform: "uppercase" as const,
          letterSpacing: "0.12em",
          fontFamily: fonts.mono,
        }}
      >
        {label}
      </div>
    </div>
  );
}
