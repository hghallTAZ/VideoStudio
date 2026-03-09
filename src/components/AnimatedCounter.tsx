/**
 * AnimatedCounter - Smoothly counts from 0 to target number.
 *
 * Used for volume reduction stats, precision metrics, etc.
 */

import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "./theme";

interface AnimatedCounterProps {
  from: number;
  to: number;
  /** Frame offset to start counting */
  startFrame?: number;
  /** Frames to complete the count */
  durationFrames?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  decimals?: number;
}

export function AnimatedCounter({
  from,
  to,
  startFrame = 0,
  durationFrames = 40,
  suffix = "",
  prefix = "",
  fontSize = 72,
  color = colors.primary,
  decimals = 0,
}: AnimatedCounterProps) {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame - startFrame,
    [0, durationFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

  return (
    <span
      style={{
        fontSize,
        fontWeight: 900,
        color,
        fontFamily: fonts.mono,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}{display}{suffix}
    </span>
  );
}
