/**
 * HashCascade - Visualize content-addressed storage as falling SHA-256 hashes.
 *
 * Documents flow in from left, get hashed, and cascade into a Merkle-tree-like
 * structure. Trust signal video - "Every byte is accounted for."
 *
 * 15s @ 30fps = 450 frames (loopable for website hero)
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  random,
  Audio,
  staticFile,
} from "remotion";
import { colors, fonts, SceneShell } from "../components";

// ---------------------------------------------------------------------------
// Hash particle
// ---------------------------------------------------------------------------

function HashParticle({
  index,
  startFrame,
}: {
  index: number;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  // Generate a fake SHA-256 hash
  const hashChars = "0123456789abcdef";
  const hash = Array.from({ length: 64 }, (_, i) =>
    hashChars[Math.floor(random(`hash-${index}-${i}`) * 16)]
  ).join("");

  const startX = -200 + random(`x-${index}`) * 400;
  const startY = 100 + random(`y-${index}`) * 800;
  const targetX = 960 + (random(`tx-${index}`) - 0.5) * 600;
  const targetY = 540 + (random(`ty-${index}`) - 0.5) * 400;

  const progress = interpolate(elapsed, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const x = interpolate(progress, [0, 1], [startX, targetX]);
  const y = interpolate(progress, [0, 1], [startY, targetY]);
  const opacity = interpolate(elapsed, [0, 5, 35, 45], [0, 0.8, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(elapsed, [0, 10, 35, 45], [0.3, 1, 1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Show truncated hash
  const visibleChars = Math.min(12, Math.floor(elapsed * 0.6));
  const displayHash = hash.slice(0, visibleChars) + (visibleChars < 12 ? "..." : "");

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        fontFamily: fonts.mono,
        fontSize: 11,
        color: colors.primary,
        backgroundColor: `${colors.primary}10`,
        border: `1px solid ${colors.primary}25`,
        borderRadius: 4,
        padding: "3px 8px",
        whiteSpace: "nowrap",
        letterSpacing: "0.05em",
      }}
    >
      {displayHash}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection line (animated)
// ---------------------------------------------------------------------------

function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  delay,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - delay, [0, 5, 80, 100], [0, 0.3, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentX2 = interpolate(progress, [0, 1], [x1, x2]);
  const currentY2 = interpolate(progress, [0, 1], [y1, y2]);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={currentX2}
      y2={currentY2}
      stroke={colors.primary}
      strokeWidth={1}
      opacity={opacity}
      strokeDasharray="4 4"
    />
  );
}

// ---------------------------------------------------------------------------
// Scene 1: Hash Cascade
// ---------------------------------------------------------------------------

function CascadeScene() {
  const frame = useCurrentFrame();

  // Spawn particles in waves
  const particles = Array.from({ length: 40 }, (_, i) => ({
    index: i,
    startFrame: i * 8 + Math.floor(random(`wave-${i}`) * 15),
  }));

  // Connection lines forming tree structure
  const connections = [
    { x1: 960, y1: 200, x2: 760, y2: 400, delay: 60 },
    { x1: 960, y1: 200, x2: 1160, y2: 400, delay: 65 },
    { x1: 760, y1: 400, x2: 660, y2: 600, delay: 100 },
    { x1: 760, y1: 400, x2: 860, y2: 600, delay: 105 },
    { x1: 1160, y1: 400, x2: 1060, y2: 600, delay: 110 },
    { x1: 1160, y1: 400, x2: 1260, y2: 600, delay: 115 },
  ];

  // Root hash
  const rootOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const rootGlow = Math.sin(frame / 10) * 0.4 + 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Grid background */}
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.1 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <line key={`v-${i}`} x1={i * 48} y1={0} x2={i * 48} y2={1080} stroke={colors.muted} strokeWidth={0.5} />
        ))}
        {Array.from({ length: 23 }, (_, i) => (
          <line key={`h-${i}`} x1={0} y1={i * 48} x2={1920} y2={i * 48} stroke={colors.muted} strokeWidth={0.5} />
        ))}
      </svg>

      {/* Tree connections */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {connections.map((c, i) => (
          <ConnectionLine key={i} {...c} />
        ))}
      </svg>

      {/* Root hash node */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 160,
          transform: "translateX(-50%)",
          opacity: rootOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: colors.amber,
            letterSpacing: "0.1em",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Merkle Root
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            color: colors.primary,
            padding: "8px 20px",
            border: `2px solid ${colors.primary}`,
            borderRadius: 8,
            backgroundColor: `${colors.primary}10`,
            textShadow: `0 0 ${20 * rootGlow}px ${colors.primary}60`,
            letterSpacing: "0.05em",
          }}
        >
          7c3a4f...e91b
        </div>
      </div>

      {/* Hash particles */}
      {particles.map((p) => (
        <HashParticle key={p.index} {...p} />
      ))}

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: interpolate(frame, [200, 230], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 800, color: colors.foreground, marginBottom: 12 }}>
          Every byte is accounted for.
        </div>
        <div style={{ fontSize: 15, color: colors.muted, fontFamily: fonts.mono, letterSpacing: "0.1em" }}>
          Content-addressed storage with SHA-256 verification
        </div>
      </div>

      {/* Corner label */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 40,
          fontFamily: fonts.mono,
          fontSize: 11,
          color: colors.muted,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.5,
        }}
      >
        ECA // Defensibility Engine
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function HashCascade() {
  return (
    <AbsoluteFill>
      <Sequence from={30}>
        <Audio src={staticFile("audio/hash-01-cascade.mp3")} />
      </Sequence>
      <Sequence from={0} durationInFrames={450}>
        <CascadeScene />
      </Sequence>
    </AbsoluteFill>
  );
}
