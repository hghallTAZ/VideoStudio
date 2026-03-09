/**
 * GlitchTrust - Glitch art trust signal.
 *
 * Text appears normal, then glitches/distorts to show the "cracks" in
 * traditional document review, then resolves into ECA's clean output.
 * RGB split, scan lines, chromatic aberration.
 *
 * 15.5s @ 30fps = 465 frames (short, punchy)
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
import { colors, fonts } from "../components";

// ---------------------------------------------------------------------------
// Scan lines overlay
// ---------------------------------------------------------------------------

function ScanLines({ opacity = 0.15 }: { opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.3) 2px,
          rgba(0,0,0,0.3) 4px
        )`,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// RGB split text
// ---------------------------------------------------------------------------

function GlitchText({
  children,
  intensity = 1,
  fontSize = 64,
  fontWeight = 900,
}: {
  children: string;
  intensity: number;
  fontSize?: number;
  fontWeight?: number;
}) {
  const frame = useCurrentFrame();
  const glitchX = intensity * (random(`gx-${Math.floor(frame / 2)}`) - 0.5) * 20;
  const glitchY = intensity * (random(`gy-${Math.floor(frame / 2)}`) - 0.5) * 8;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Red channel */}
      <div
        style={{
          position: "absolute",
          left: -3 * intensity,
          top: -1 * intensity,
          fontSize,
          fontWeight,
          color: "rgba(255,0,0,0.5)",
          fontFamily: fonts.body,
          mixBlendMode: "screen",
          transform: `translate(${glitchX * 0.5}px, ${glitchY * 0.3}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
      {/* Blue channel */}
      <div
        style={{
          position: "absolute",
          left: 3 * intensity,
          top: 1 * intensity,
          fontSize,
          fontWeight,
          color: "rgba(0,100,255,0.5)",
          fontFamily: fonts.body,
          mixBlendMode: "screen",
          transform: `translate(${-glitchX * 0.5}px, ${-glitchY * 0.3}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
      {/* Main text */}
      <div
        style={{
          position: "relative",
          fontSize,
          fontWeight,
          color: colors.foreground,
          fontFamily: fonts.body,
          transform: `translate(${glitchX * 0.2}px, 0)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glitch bar (horizontal displacement artifact)
// ---------------------------------------------------------------------------

function GlitchBar({ frame: f }: { frame: number }) {
  const bars: React.ReactNode[] = [];

  for (let i = 0; i < 5; i++) {
    const active = random(`bar-${i}-${Math.floor(f / 3)}`) > 0.6;
    if (!active) continue;

    const y = random(`bar-y-${i}-${Math.floor(f / 2)}`) * 1080;
    const height = 2 + random(`bar-h-${i}`) * 20;
    const offset = (random(`bar-ox-${i}-${Math.floor(f / 2)}`) - 0.5) * 200;

    bars.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          height,
          transform: `translateX(${offset}px)`,
          backgroundColor: `rgba(${random(`bar-r-${i}`) > 0.5 ? "255,0,0" : "0,100,255"},0.15)`,
          pointerEvents: "none",
        }}
      />
    );
  }

  return <>{bars}</>;
}

// ---------------------------------------------------------------------------
// Scene 1: The old way (glitchy)
// ---------------------------------------------------------------------------

function OldWayScene() {
  const frame = useCurrentFrame();

  // Glitch intensity ramps up
  const intensity = interpolate(frame, [0, 60, 90, 120], [0, 0.5, 2, 4], {
    extrapolateRight: "clamp",
  });

  const scanOpacity = interpolate(frame, [30, 90], [0.05, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <ScanLines opacity={scanOpacity} />
      {intensity > 0.5 && <GlitchBar frame={frame} />}

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <GlitchText intensity={intensity} fontSize={56}>
          Manual Review
        </GlitchText>
        <div style={{ height: 20 }} />
        <GlitchText intensity={intensity * 0.7} fontSize={24} fontWeight={600}>
          Hope you didn't miss anything.
        </GlitchText>
      </div>

      {/* Glitch counter */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          fontFamily: fonts.mono,
          fontSize: 14,
          color: "#ff3333",
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div>ERRORS: {Math.floor(interpolate(frame, [60, 120], [0, 2847], { extrapolateRight: "clamp" }))}</div>
        <div>MISSED: {Math.floor(interpolate(frame, [70, 120], [0, 412], { extrapolateRight: "clamp" }))}</div>
        <div>COST: ${Math.floor(interpolate(frame, [80, 120], [0, 847000], { extrapolateRight: "clamp" })).toLocaleString()}</div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 2: The transition (hard cut to clean)
// ---------------------------------------------------------------------------

function TransitionScene() {
  const frame = useCurrentFrame();

  // Flash white then settle
  const flashOpacity = interpolate(frame, [0, 3, 8], [1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* White flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          opacity: flashOpacity,
        }}
      />

      {/* Clean text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: colors.amber,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: 30,
          }}
        >
          There's a better way
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 3: Clean ECA output
// ---------------------------------------------------------------------------

function CleanScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: "AI", label: "Every decision cited", delay: 10 },
    { icon: "SHA", label: "Every byte verified", delay: 25 },
    { icon: "LOG", label: "Every action audited", delay: 40 },
  ];

  const titleScale = spring({ frame: frame - 5, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${titleScale})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 900, color: colors.foreground }}>
          AI-Assisted Triage
        </div>
        <div
          style={{
            fontSize: 20,
            color: colors.muted,
            marginTop: 12,
            fontFamily: fonts.mono,
            letterSpacing: "0.05em",
          }}
        >
          Precision you can defend in court.
        </div>
      </div>

      {/* Feature list */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 40,
        }}
      >
        {features.map((feat, i) => {
          const opacity = interpolate(frame - feat.delay, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame - feat.delay, [0, 12], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  border: `2px solid ${colors.primary}40`,
                  backgroundColor: `${colors.primary}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: colors.primary,
                  fontFamily: fonts.mono,
                  margin: "0 auto 12px",
                }}
              >
                {feat.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.foreground }}>
                {feat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: fonts.mono,
          fontSize: 20,
          fontWeight: 700,
          color: colors.primary,
          letterSpacing: "0.05em",
        }}
      >
        ecasses.com
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function GlitchTrust() {
  // Audio durations (measured via ffprobe @ 30fps):
  // glitch-01: 93, glitch-02: 261
  // FIXED: glitch-02 was cut off (started 170, ended 431, but video was only 360)
  // Scene starts: 0, 135, 165 -> total 465 frames (15.5s)
  return (
    <AbsoluteFill>
      {/* Narration - capped to prevent bleed */}
      <Sequence from={20} durationInFrames={93}>
        <Audio src={staticFile("audio/glitch-01-old.mp3")} />
      </Sequence>
      <Sequence from={185} durationInFrames={261}>
        <Audio src={staticFile("audio/glitch-02-clean.mp3")} />
      </Sequence>

      {/* Scenes */}
      <Sequence from={0} durationInFrames={145}>
        <OldWayScene />
      </Sequence>
      <Sequence from={135} durationInFrames={40}>
        <TransitionScene />
      </Sequence>
      <Sequence from={165} durationInFrames={300}>
        <CleanScene />
      </Sequence>
    </AbsoluteFill>
  );
}
