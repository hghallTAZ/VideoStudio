/**
 * MatrixRedaction - Hacker terminal aesthetic meets legal redaction.
 *
 * Falling green characters resolve into redacted document text,
 * then the redaction bars peel away to reveal "What's underneath matters."
 *
 * 20s @ 30fps = 600 frames
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
import { SceneShell, FadeIn, colors, fonts } from "../components";

// ---------------------------------------------------------------------------
// Matrix rain column
// ---------------------------------------------------------------------------

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

function MatrixColumn({ col, speed, startFrame }: { col: number; speed: number; startFrame: number }) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const chars: React.ReactNode[] = [];
  const x = col * 22;

  for (let i = 0; i < 50; i++) {
    const charIndex = Math.floor(random(`col-${col}-row-${i}-f-${Math.floor(elapsed / 3)}`) * CHARS.length);
    const y = ((elapsed * speed + i * 22) % 1200) - 100;
    const isHead = i === 0;
    const opacity = interpolate(i, [0, 5, 45, 50], [1, 0.8, 0.2, 0], {
      extrapolateRight: "clamp",
    });

    chars.push(
      <text
        key={i}
        x={x}
        y={y}
        fill={isHead ? "#ffffff" : colors.success}
        opacity={opacity * interpolate(elapsed, [0, 10], [0, 1], { extrapolateRight: "clamp" })}
        fontSize={16}
        fontFamily={fonts.mono}
      >
        {CHARS[charIndex]}
      </text>
    );
  }

  return <>{chars}</>;
}

// ---------------------------------------------------------------------------
// Scene 1: Matrix Rain (0-8s)
// ---------------------------------------------------------------------------

function MatrixRainScene() {
  const frame = useCurrentFrame();
  const columns = Array.from({ length: 88 }, (_, i) => ({
    col: i,
    speed: 2 + random(`speed-${i}`) * 4,
    startFrame: Math.floor(random(`start-${i}`) * 30),
  }));

  const textOpacity = interpolate(frame, [120, 150], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {columns.map((c) => (
          <MatrixColumn key={c.col} {...c} />
        ))}
      </svg>

      {/* Prompt text typing in */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          opacity: textOpacity,
          fontFamily: fonts.mono,
          fontSize: 20,
          color: colors.success,
        }}
      >
        <span style={{ color: colors.amber }}>$</span>{" "}
        {"> scanning 100GB corpus...".slice(0, Math.max(0, Math.floor((frame - 120) / 2)))}
        {frame % 20 < 10 && frame > 120 && (
          <span style={{ color: colors.success }}>_</span>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 2: Redacted Document (8-15s)
// ---------------------------------------------------------------------------

function RedactedDocScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    { text: "MEMORANDUM - CONFIDENTIAL", redacted: false, y: 200 },
    { text: "RE: California Energy Trading Positions", redacted: false, y: 260 },
    { text: "", redacted: false, y: 300 },
    { text: "The following documents contain evidence of", redacted: false, y: 340 },
    { text: "████████████████████████████████████", redacted: true, y: 380 },
    { text: "████████████ trading strategies that", redacted: true, y: 420 },
    { text: "resulted in ██████████████████████", redacted: true, y: 460 },
    { text: "", redacted: false, y: 500 },
    { text: "Relevant custodians:", redacted: false, y: 540 },
    { text: "  - ████████████████", redacted: true, y: 580 },
    { text: "  - Allen, Phillip K.", redacted: false, y: 620 },
    { text: "  - ████████████████", redacted: true, y: 660 },
    { text: "", redacted: false, y: 700 },
    { text: "Total responsive documents: 3,034", redacted: false, y: 740 },
    { text: "AI triage confidence: 89% recall", redacted: false, y: 780 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Paper background */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 700,
          backgroundColor: "#111111",
          border: `1px solid ${colors.muted}30`,
          borderRadius: 4,
          padding: 40,
        }}
      >
        {lines.map((line, i) => {
          const delay = i * 4;
          const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame - delay, [0, 10], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Redaction bars peel away
          const peelProgress = line.redacted
            ? interpolate(frame, [120, 180], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                fontFamily: fonts.mono,
                fontSize: line.text.startsWith("MEMO") ? 18 : 15,
                fontWeight: line.text.startsWith("MEMO") ? 800 : 400,
                color: line.redacted
                  ? interpolate(peelProgress, [0, 1], [0, 1]).toString().startsWith("0")
                    ? colors.foreground
                    : colors.success
                  : colors.foreground,
                marginBottom: 4,
                letterSpacing: "0.02em",
                position: "relative",
              }}
            >
              {line.text}
              {line.redacted && peelProgress < 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: `${peelProgress * 100}%`,
                    bottom: 0,
                    backgroundColor: colors.foreground,
                    opacity: 0.9,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Corner classification stamp */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          fontFamily: fonts.mono,
          fontSize: 11,
          color: colors.amber,
          opacity: interpolate(frame, [5, 15], [0, 0.6], { extrapolateRight: "clamp" }),
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          transform: "rotate(3deg)",
          border: `1px solid ${colors.amber}40`,
          padding: "6px 14px",
        }}
      >
        PRIVILEGED & CONFIDENTIAL
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 3: Reveal (15-20s)
// ---------------------------------------------------------------------------

function RevealScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 80 } });
  const subOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const glowPulse = Math.sin(frame / 8) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${mainScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: colors.foreground,
            marginBottom: 24,
            textShadow: `0 0 ${40 * glowPulse}px ${colors.primary}40`,
          }}
        >
          What's underneath matters.
        </div>
        <div
          style={{
            opacity: subOpacity,
            fontSize: 22,
            color: colors.muted,
            fontFamily: fonts.mono,
            letterSpacing: "0.1em",
          }}
        >
          ECA Triage Accelerator
        </div>
        <div
          style={{
            opacity: subOpacity * 0.7,
            fontSize: 14,
            color: colors.primary,
            fontFamily: fonts.mono,
            marginTop: 20,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          ecasses.com
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function MatrixRedaction() {
  // Audio durations (measured via ffprobe @ 30fps):
  // matrix-01: 134, matrix-02: 220, matrix-03: 95
  // Pattern: 20-frame lead-in + audio + 30-frame buffer
  // Scene starts: 0, 185, 455 -> total 600 frames (20s)
  return (
    <AbsoluteFill>
      {/* Narration - capped to prevent bleed */}
      <Sequence from={20} durationInFrames={134}>
        <Audio src={staticFile("audio/matrix-01-rain.mp3")} />
      </Sequence>
      <Sequence from={205} durationInFrames={220}>
        <Audio src={staticFile("audio/matrix-02-redacted.mp3")} />
      </Sequence>
      <Sequence from={475} durationInFrames={95}>
        <Audio src={staticFile("audio/matrix-03-reveal.mp3")} />
      </Sequence>

      {/* Scenes - no overlaps */}
      <Sequence from={0} durationInFrames={185}>
        <MatrixRainScene />
      </Sequence>
      <Sequence from={185} durationInFrames={270}>
        <RedactedDocScene />
      </Sequence>
      <Sequence from={455} durationInFrames={145}>
        <RevealScene />
      </Sequence>
    </AbsoluteFill>
  );
}
