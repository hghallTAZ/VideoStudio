/**
 * SizzleReel - 60 second brand video for website hero and LinkedIn.
 *
 * 6 scenes: Problem -> Logo -> Pipeline -> Stats -> Precision -> CTA
 * 1920x1080 @ 30fps = 1800 frames
 */

import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  Audio,
  staticFile,
} from "remotion";
import {
  SceneShell,
  FadeIn,
  MetricCard,
  AnimatedCounter,
  Watermark,
  colors,
  fonts,
} from "../components";

// ---------------------------------------------------------------------------
// Scene 1: The Problem (0-5s, frames 0-150)
// ---------------------------------------------------------------------------

function ProblemScene() {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const line2Opacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const urgencyOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: "clamp" });
  const urgencyScale = interpolate(frame, [70, 85], [0.8, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell showGrid showTape tapePosition="bottom">
      <div style={{ textAlign: "center" }}>
        <div style={{ opacity: line1Opacity, fontSize: 64, fontWeight: 800, color: colors.foreground, marginBottom: 20 }}>
          100 GB of documents.
        </div>
        <div style={{ opacity: line2Opacity, fontSize: 64, fontWeight: 800, color: colors.foreground, marginBottom: 40 }}>
          72 hours to respond.
        </div>
        <div
          style={{
            opacity: urgencyOpacity,
            transform: `scale(${urgencyScale})`,
            fontSize: 18,
            fontWeight: 700,
            color: colors.amber,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          What do you actually need to review?
        </div>
      </div>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 2: Logo Reveal (5-10s)
// ---------------------------------------------------------------------------

function LogoScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [20, 40], [30, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell showGrid>
      <div style={{ transform: `scale(${iconScale})`, marginBottom: 40 }}>
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v17" />
          <path d="M5 7l7-4 7 4" />
          <path d="M5 7l-1.5 5h5L5 7z" />
          <path d="M19 7l-1.5 5h5L19 7z" />
          <circle cx="12" cy="20" r="1" fill={colors.primary} />
        </svg>
      </div>
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, fontSize: 64, fontWeight: 800, color: colors.foreground }}>
        ECA Triage Accelerator
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 20,
          color: colors.muted,
          marginTop: 16,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: fonts.mono,
        }}
      >
        Pre-processing for legal e-discovery
      </div>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 3: Volume Reduction Pipeline (10-22s)
// ---------------------------------------------------------------------------

function PipelineScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stages = [
    { label: "Collection", size: "100 GB", width: 400, color: colors.muted, delay: 0 },
    { label: "Dedup + Filter", size: "45 GB", width: 280, color: colors.mutedLight, delay: 20 },
    { label: "AI Triage", size: "12 GB", width: 160, color: colors.primary, delay: 40 },
    { label: "Review Set", size: "5 GB", width: 80, color: colors.success, delay: 60 },
  ];

  const arrowOpacity = (delay: number) =>
    interpolate(frame - delay, [10, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneShell showGrid showTape>
      <FadeIn delay={0} duration={15}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.amber,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 60,
          }}
        >
          Volume Reduction Pipeline
        </div>
      </FadeIn>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {stages.map((stage, i) => {
          const scale = spring({ frame: frame - stage.delay, fps, config: { damping: 15 } });
          const opacity = interpolate(frame - stage.delay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  opacity,
                  transform: `scale(${Math.max(0, scale)})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: stage.width,
                    height: 80,
                    borderRadius: 12,
                    border: `2px solid ${stage.color}40`,
                    backgroundColor: `${stage.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 32, fontWeight: 900, color: stage.color, fontFamily: fonts.mono }}>
                    {stage.size}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.muted, fontFamily: fonts.mono, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stage.label}
                </span>
              </div>

              {i < stages.length - 1 && (
                <div style={{ opacity: arrowOpacity(stage.delay + 15), color: colors.muted, fontSize: 24 }}>
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FadeIn delay={90} duration={20}>
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: colors.success, fontFamily: fonts.mono }}>95%</span>
          <span style={{ fontSize: 24, fontWeight: 600, color: colors.muted, marginLeft: 16 }}>volume reduction</span>
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 4: Key Metrics (22-34s)
// ---------------------------------------------------------------------------

function MetricsScene() {
  return (
    <SceneShell showGrid showTape>
      <FadeIn delay={0} duration={15}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.amber,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 50,
          }}
        >
          Validated Performance
        </div>
      </FadeIn>
      <div style={{ display: "flex", gap: 40 }}>
        <MetricCard value="48%" label="P@10 Precision" delay={5} valueColor={colors.primary} />
        <MetricCard value="89%" label="Macro Recall" delay={13} valueColor={colors.primary} />
        <MetricCard value="50+" label="File Formats" delay={21} valueColor={colors.amber} />
        <MetricCard value="5" label="Search Modes" delay={29} valueColor={colors.amber} />
      </div>
      <FadeIn delay={45} duration={15}>
        <div style={{ marginTop: 40, fontSize: 14, color: colors.muted, fontFamily: fonts.mono, letterSpacing: "0.05em" }}>
          Enron benchmark corpus - 3,034 emails, 4,022 chunks
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 5: Defensibility (34-46s)
// ---------------------------------------------------------------------------

function DefensibilityScene() {
  const frame = useCurrentFrame();

  const features = [
    { icon: "SHA-256", label: "Content-addressed storage", delay: 5 },
    { icon: "CITE", label: "Every AI decision cites source text", delay: 20 },
    { icon: "AUDIT", label: "Immutable processing log", delay: 35 },
    { icon: "EXPORT", label: "Court-ready load files", delay: 50 },
  ];

  return (
    <SceneShell showGrid showTape>
      <FadeIn delay={0} duration={15}>
        <div style={{ fontSize: 42, fontWeight: 800, color: colors.foreground, marginBottom: 60 }}>
          Built for Court
        </div>
      </FadeIn>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {features.map((feat, i) => {
          const opacity = interpolate(frame - feat.delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame - feat.delay, [0, 15], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 40,
                  borderRadius: 8,
                  border: `1px solid ${colors.primary}40`,
                  backgroundColor: `${colors.primary}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: colors.primary,
                  fontFamily: fonts.mono,
                  letterSpacing: "0.05em",
                }}
              >
                {feat.icon}
              </div>
              <span style={{ fontSize: 22, fontWeight: 600, color: colors.foreground }}>
                {feat.label}
              </span>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 6: CTA (46-60s)
// ---------------------------------------------------------------------------

function CTAScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 30, fps, config: { damping: 15 } });
  const badgeOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell showGrid>
      <div style={{ textAlign: "center" }}>
        <div style={{ opacity: titleOpacity, fontSize: 52, fontWeight: 800, color: colors.foreground, marginBottom: 20 }}>
          Turn 100 GB into 5 GB
        </div>
        <div style={{ opacity: subtitleOpacity, fontSize: 22, color: colors.muted, marginBottom: 60 }}>
          Before your first review platform bill.
        </div>
        <div
          style={{
            opacity: badgeOpacity,
            transform: `scale(${Math.max(0, badgeScale)})`,
            display: "inline-block",
            padding: "18px 56px",
            border: `2px solid ${colors.primary}`,
            borderRadius: 14,
            fontSize: 30,
            fontWeight: 700,
            color: colors.primary,
            fontFamily: fonts.mono,
            letterSpacing: "0.05em",
          }}
        >
          ecasses.com
        </div>
      </div>
      <Watermark />
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Main Composition
// ---------------------------------------------------------------------------

export function SizzleReel() {
  // Audio durations (measured via ffprobe, ceil'd to frames @ 30fps):
  // sizzle-01: 193, sizzle-02: 150, sizzle-03: 279, sizzle-04: 258
  // sizzle-05: 282, sizzle-06: 187
  // Pattern: 20-frame lead-in + audio + ~55-frame buffer per scene
  // Scene starts: 0, 268, 493, 847, 1180, 1537 -> total 1800 frames (60s)
  return (
    <AbsoluteFill>
      {/* Narration audio tracks - each capped to prevent bleed */}
      <Sequence from={20} durationInFrames={193}>
        <Audio src={staticFile("audio/sizzle-01-problem.mp3")} />
      </Sequence>
      <Sequence from={288} durationInFrames={150}>
        <Audio src={staticFile("audio/sizzle-02-logo.mp3")} />
      </Sequence>
      <Sequence from={513} durationInFrames={279}>
        <Audio src={staticFile("audio/sizzle-03-pipeline.mp3")} />
      </Sequence>
      <Sequence from={867} durationInFrames={258}>
        <Audio src={staticFile("audio/sizzle-04-metrics.mp3")} />
      </Sequence>
      <Sequence from={1200} durationInFrames={282}>
        <Audio src={staticFile("audio/sizzle-05-defensibility.mp3")} />
      </Sequence>
      <Sequence from={1557} durationInFrames={187}>
        <Audio src={staticFile("audio/sizzle-06-cta.mp3")} />
      </Sequence>

      {/* Visual scenes - no overlaps, clean cuts */}
      <Sequence from={0} durationInFrames={268}>
        <ProblemScene />
      </Sequence>
      <Sequence from={268} durationInFrames={225}>
        <LogoScene />
      </Sequence>
      <Sequence from={493} durationInFrames={354}>
        <PipelineScene />
      </Sequence>
      <Sequence from={847} durationInFrames={333}>
        <MetricsScene />
      </Sequence>
      <Sequence from={1180} durationInFrames={357}>
        <DefensibilityScene />
      </Sequence>
      <Sequence from={1537} durationInFrames={263}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
}
