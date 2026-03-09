import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
} from "remotion";

const DARK_BG = "#0a0a0a";
const PRIMARY = "#3b82f6";
const AMBER = "#f59e0b";
const MUTED = "#737373";

// Scene 1: Title card with scale icon animation
function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Grid pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${MUTED}15 1px, transparent 1px), linear-gradient(90deg, ${MUTED}15 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scale icon (SVG) */}
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 40 }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v17" />
          <path d="M5 7l7-4 7 4" />
          <path d="M5 7l-1.5 5h5L5 7z" />
          <path d="M19 7l-1.5 5h5L19 7z" />
          <circle cx="12" cy="20" r="1" fill={PRIMARY} />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: "#e5e5e5",
          letterSpacing: "-0.02em",
        }}
      >
        ECA Triage Accelerator
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 24,
          fontWeight: 500,
          color: MUTED,
          marginTop: 16,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          fontFamily: "monospace",
        }}
      >
        Discovery at Zero Latency
      </div>
    </AbsoluteFill>
  );
}

// Scene 2: Stats animation
function StatsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { label: "Volume Reduction", value: "95%", delay: 0 },
    { label: "Search Precision", value: "48% P@10", delay: 8 },
    { label: "File Formats", value: "50+", delay: 16 },
    { label: "Audit Trail", value: "100%", delay: 24 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Evidence tape accent line */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          height: 2,
          background: `repeating-linear-gradient(90deg, ${AMBER} 0px, ${AMBER} 20px, transparent 20px, transparent 30px)`,
          opacity: 0.4,
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "center",
        }}
      >
        {stats.map((stat, i) => {
          const stagger = stat.delay;
          const scale = spring({ frame: frame - stagger, fps, config: { damping: 12 } });
          const opacity = interpolate(frame - stagger, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `scale(${Math.max(0, scale)})`,
                textAlign: "center" as const,
                padding: "40px 30px",
                border: `1px solid ${MUTED}30`,
                borderRadius: 16,
                backgroundColor: `${MUTED}08`,
                minWidth: 220,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: PRIMARY,
                  marginBottom: 12,
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: MUTED,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  fontFamily: "monospace",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          height: 2,
          background: `repeating-linear-gradient(90deg, ${AMBER} 0px, ${AMBER} 20px, transparent 20px, transparent 30px)`,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
}

// Scene 3: Closing with tagline
function ClosingScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 10, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ opacity, textAlign: "center" as const }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#e5e5e5",
            marginBottom: 24,
          }}
        >
          Turn 100 GB into 5 GB
        </div>
        <div
          style={{
            fontSize: 20,
            color: MUTED,
            marginBottom: 48,
          }}
        >
          Before your first review platform bill.
        </div>
      </div>

      <div
        style={{
          opacity: urlOpacity,
          transform: `scale(${Math.max(0, badgeScale)})`,
          padding: "16px 48px",
          border: `2px solid ${PRIMARY}`,
          borderRadius: 12,
          fontSize: 28,
          fontWeight: 700,
          color: PRIMARY,
          fontFamily: "monospace",
          letterSpacing: "0.05em",
        }}
      >
        ecasses.com
      </div>

      {/* Made by Claude badge */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          opacity: urlOpacity,
          fontSize: 12,
          color: `${MUTED}80`,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
        }}
      >
        Video generated programmatically by Claude Code + Remotion
      </div>
    </AbsoluteFill>
  );
}

// Main composition
export function HelloVideo() {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={70}>
        <TitleScene />
      </Sequence>
      <Sequence from={60} durationInFrames={70}>
        <StatsScene />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
}
