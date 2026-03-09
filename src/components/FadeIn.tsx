/**
 * FadeIn - Universal fade + slide entrance wrapper.
 */

import { useCurrentFrame, interpolate } from "remotion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideY?: number;
  slideX?: number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 20,
  slideY = 30,
  slideX = 0,
}: FadeInProps) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame - delay, [0, duration], [slideY, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const x = interpolate(frame - delay, [0, duration], [slideX, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </div>
  );
}
