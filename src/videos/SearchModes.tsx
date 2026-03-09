/**
 * SearchModes - Animated explainer showing all 5 search modes.
 *
 * Each mode gets a visual metaphor: keyword = exact match highlights,
 * semantic = concept clouds, hybrid = both merging, rag_fusion = multi-query
 * branching, full = the whole pipeline with reranking.
 *
 * 35s @ 30fps = 1050 frames
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
import { SceneShell, FadeIn, MetricCard, colors, fonts } from "../components";

// ---------------------------------------------------------------------------
// Shared: Search result row
// ---------------------------------------------------------------------------

function ResultRow({
  rank,
  title,
  snippet,
  score,
  delay,
  highlight,
  scoreColor = colors.primary,
}: {
  rank: number;
  title: string;
  snippet: string;
  score: string;
  delay: number;
  highlight?: string;
  scoreColor?: string;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame - delay, [0, 8], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight matching terms
  let snippetEl: React.ReactNode = snippet;
  if (highlight) {
    const parts = snippet.split(new RegExp(`(${highlight})`, "gi"));
    snippetEl = parts.map((part, i) =>
      part.toLowerCase() === highlight?.toLowerCase() ? (
        <span key={i} style={{ color: colors.amber, fontWeight: 700, backgroundColor: `${colors.amber}20`, padding: "0 3px", borderRadius: 2 }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        padding: "12px 0",
        borderBottom: `1px solid ${colors.muted}15`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: `${scoreColor}15`,
          border: `1px solid ${scoreColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: scoreColor,
          fontFamily: fonts.mono,
          flexShrink: 0,
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.foreground, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: colors.muted, lineHeight: "18px" }}>
          {snippetEl}
        </div>
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 12,
          color: scoreColor,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {score}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode card with icon
// ---------------------------------------------------------------------------

function ModeCard({
  mode,
  icon,
  description,
  active,
}: {
  mode: string;
  icon: string;
  description: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 20px",
        borderRadius: 10,
        border: `2px solid ${active ? colors.primary : colors.muted + "30"}`,
        backgroundColor: active ? `${colors.primary}15` : "transparent",
        transition: "all 0.3s",
        minWidth: 140,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: active ? colors.primary : colors.muted,
          fontFamily: fonts.mono,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {mode}
      </div>
      <div style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
        {description}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 1: Intro + Mode Selector
// ---------------------------------------------------------------------------

function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const modes = [
    { mode: "keyword", icon: "K", description: "Exact match" },
    { mode: "semantic", icon: "S", description: "Concept search" },
    { mode: "hybrid", icon: "H", description: "BM25 + vector" },
    { mode: "rag_fusion", icon: "R", description: "Multi-query" },
    { mode: "full", icon: "F", description: "Full pipeline" },
  ];

  const activeIndex = Math.min(4, Math.floor(interpolate(frame, [60, 180], [0, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })));

  return (
    <SceneShell showGrid>
      <FadeIn delay={0} duration={15}>
        <div style={{ fontSize: 42, fontWeight: 800, color: colors.foreground, marginBottom: 12 }}>
          5 Ways to Find What Matters
        </div>
      </FadeIn>
      <FadeIn delay={10} duration={15}>
        <div
          style={{
            fontSize: 15,
            color: colors.muted,
            fontFamily: fonts.mono,
            letterSpacing: "0.1em",
            marginBottom: 50,
          }}
        >
          Each mode adds intelligence. Pick your precision level.
        </div>
      </FadeIn>

      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
        {modes.map((m, i) => {
          const delay = 30 + i * 10;
          const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{ opacity }}>
              <ModeCard {...m} active={i === activeIndex} />
            </div>
          );
        })}
      </div>

      {/* Query bar */}
      <FadeIn delay={80} duration={15}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 24px",
            borderRadius: 12,
            border: `1px solid ${colors.primary}40`,
            backgroundColor: `${colors.primary}08`,
            width: 600,
          }}
        >
          <span style={{ color: colors.primary, fontSize: 18 }}>Q</span>
          <span style={{ color: colors.foreground, fontSize: 16 }}>
            {"California energy trading positions".slice(
              0,
              Math.max(0, Math.floor((frame - 90) * 0.7))
            )}
          </span>
          {frame % 16 < 8 && frame > 90 && frame < 150 && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 20,
                backgroundColor: colors.primary,
              }}
            />
          )}
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 2: Keyword vs Semantic comparison
// ---------------------------------------------------------------------------

function ComparisonScene() {
  const frame = useCurrentFrame();

  return (
    <SceneShell showGrid showTape>
      <div style={{ display: "flex", gap: 60, width: "100%" }}>
        {/* Keyword side */}
        <div style={{ flex: 1 }}>
          <FadeIn delay={0} duration={10}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: colors.amber,
                fontFamily: fonts.mono,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 24,
              }}
            >
              Keyword (BM25)
            </div>
          </FadeIn>
          <ResultRow rank={1} title="RE: California Power Exchange" snippet="California energy markets show significant trading activity in Q3..." score="4.21" delay={10} highlight="California" />
          <ResultRow rank={2} title="Energy Trading Report - CA" snippet="The California ISO reported energy shortages affecting trading..." score="3.87" delay={18} highlight="energy" />
          <ResultRow rank={3} title="CA Market Analysis" snippet="California energy derivatives and trading positions for review..." score="3.54" delay={26} highlight="trading" />
        </div>

        {/* Divider */}
        <div style={{ width: 2, backgroundColor: `${colors.muted}20`, alignSelf: "stretch" }} />

        {/* Semantic side */}
        <div style={{ flex: 1 }}>
          <FadeIn delay={5} duration={10}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: colors.primary,
                fontFamily: fonts.mono,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 24,
              }}
            >
              Semantic (Vector)
            </div>
          </FadeIn>
          <ResultRow rank={1} title="West Coast Power Strategy Memo" snippet="Our position in the western grid requires careful management of exposure..." score="0.91" delay={15} scoreColor={colors.primary} />
          <ResultRow rank={2} title="RE: Enron Power Trading" snippet="The desk has been actively managing our generation assets to optimize..." score="0.87" delay={23} scoreColor={colors.primary} />
          <ResultRow rank={3} title="Market Manipulation Concerns" snippet="There are concerns about artificial scarcity driving prices up..." score="0.84" delay={31} scoreColor={colors.primary} />
        </div>
      </div>

      {/* Insight */}
      <FadeIn delay={60} duration={15}>
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            padding: "16px 32px",
            borderRadius: 10,
            border: `1px solid ${colors.success}30`,
            backgroundColor: `${colors.success}08`,
          }}
        >
          <span style={{ color: colors.success, fontWeight: 700, fontSize: 15 }}>
            Semantic finds conceptually related docs that keyword search misses
          </span>
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 3: Hybrid fusion visualization
// ---------------------------------------------------------------------------

function HybridScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mergeProgress = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell showGrid showTape tapePosition="bottom">
      <FadeIn delay={0} duration={10}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: colors.amber,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 40,
          }}
        >
          Hybrid: Reciprocal Rank Fusion
        </div>
      </FadeIn>

      {/* Pipeline visualization */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 50 }}>
        {/* BM25 */}
        <FadeIn delay={5} duration={10}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 120,
                height: 80,
                borderRadius: 10,
                border: `2px solid ${colors.amber}40`,
                backgroundColor: `${colors.amber}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.mono,
                fontSize: 16,
                fontWeight: 800,
                color: colors.amber,
              }}
            >
              BM25
            </div>
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 8, fontFamily: fonts.mono }}>
              rank_a
            </div>
          </div>
        </FadeIn>

        {/* Arrow */}
        <FadeIn delay={20} duration={10}>
          <div style={{ color: colors.muted, fontSize: 28 }}>+</div>
        </FadeIn>

        {/* Vector */}
        <FadeIn delay={15} duration={10}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 120,
                height: 80,
                borderRadius: 10,
                border: `2px solid ${colors.primary}40`,
                backgroundColor: `${colors.primary}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.mono,
                fontSize: 16,
                fontWeight: 800,
                color: colors.primary,
              }}
            >
              Vector
            </div>
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 8, fontFamily: fonts.mono }}>
              rank_b
            </div>
          </div>
        </FadeIn>

        {/* Arrow */}
        <FadeIn delay={30} duration={10}>
          <div style={{ color: colors.muted, fontSize: 28 }}>=</div>
        </FadeIn>

        {/* RRF */}
        <FadeIn delay={35} duration={10}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 160,
                height: 80,
                borderRadius: 10,
                border: `2px solid ${colors.success}`,
                backgroundColor: `${colors.success}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 800, color: colors.success }}>
                RRF
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.muted }}>
                1/(rank+60)
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Result */}
      <FadeIn delay={60} duration={15}>
        <div style={{ display: "flex", gap: 40 }}>
          <MetricCard value="48%" label="P@10 Precision" delay={65} valueColor={colors.success} />
          <MetricCard value="+43%" label="vs Semantic Only" delay={73} valueColor={colors.amber} />
          <MetricCard value="89%" label="Macro Recall" delay={81} valueColor={colors.primary} />
        </div>
      </FadeIn>

      <FadeIn delay={100} duration={15}>
        <div style={{ marginTop: 30, fontSize: 13, color: colors.muted, fontFamily: fonts.mono, letterSpacing: "0.05em" }}>
          Validated on Enron corpus - 3,034 emails, 40 queries across 4 topics
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Scene 4: Full pipeline
// ---------------------------------------------------------------------------

function FullPipelineScene() {
  const frame = useCurrentFrame();

  const stages = [
    { label: "Query", icon: "Q", color: colors.foreground, delay: 0 },
    { label: "Expand", icon: "x4", color: colors.amber, delay: 15 },
    { label: "BM25", icon: "K", color: colors.amber, delay: 30 },
    { label: "Vector", icon: "V", color: colors.primary, delay: 45 },
    { label: "RRF", icon: "F", color: colors.success, delay: 60 },
    { label: "Rerank", icon: "AI", color: colors.primary, delay: 75 },
    { label: "Top 10", icon: "10", color: colors.success, delay: 90 },
  ];

  return (
    <SceneShell showGrid>
      <FadeIn delay={0} duration={10}>
        <div style={{ fontSize: 36, fontWeight: 800, color: colors.foreground, marginBottom: 12 }}>
          Full Mode: Maximum Precision
        </div>
        <div
          style={{
            fontSize: 14,
            color: colors.muted,
            fontFamily: fonts.mono,
            marginBottom: 50,
            letterSpacing: "0.05em",
          }}
        >
          2 LLM calls: query expansion + reranking
        </div>
      </FadeIn>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {stages.map((stage, i) => {
          const opacity = interpolate(frame - stage.delay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const scale = interpolate(frame - stage.delay, [0, 10], [0.7, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    border: `2px solid ${stage.color}40`,
                    backgroundColor: `${stage.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: stage.color,
                    fontFamily: fonts.mono,
                  }}
                >
                  {stage.icon}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: colors.muted,
                    fontFamily: fonts.mono,
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stage.label}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div
                  style={{
                    opacity: interpolate(frame - stage.delay - 10, [0, 5], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    color: colors.muted,
                    fontSize: 18,
                  }}
                >
                  {"\u2192"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FadeIn delay={110} duration={15}>
        <div
          style={{
            marginTop: 50,
            padding: "20px 40px",
            borderRadius: 12,
            border: `2px solid ${colors.success}40`,
            backgroundColor: `${colors.success}08`,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: colors.success }}>
            Find exactly what's responsive. Nothing more, nothing less.
          </span>
        </div>
      </FadeIn>
    </SceneShell>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function SearchModes() {
  // Audio durations (measured via ffprobe @ 30fps):
  // search-01: 160, search-02: 237, search-03: 274, search-04: 233
  // FIXED: search-03 (274 frames) overlapped search-04 by 54 frames
  // Scene starts: 0, 195, 467, 776 -> total 1050 frames (35s)
  return (
    <AbsoluteFill>
      {/* Narration - capped to prevent bleed */}
      <Sequence from={20} durationInFrames={160}>
        <Audio src={staticFile("audio/search-01-intro.mp3")} />
      </Sequence>
      <Sequence from={215} durationInFrames={237}>
        <Audio src={staticFile("audio/search-02-comparison.mp3")} />
      </Sequence>
      <Sequence from={487} durationInFrames={274}>
        <Audio src={staticFile("audio/search-03-hybrid.mp3")} />
      </Sequence>
      <Sequence from={796} durationInFrames={233}>
        <Audio src={staticFile("audio/search-04-full.mp3")} />
      </Sequence>

      {/* Scenes - no overlaps */}
      <Sequence from={0} durationInFrames={195}>
        <IntroScene />
      </Sequence>
      <Sequence from={195} durationInFrames={272}>
        <ComparisonScene />
      </Sequence>
      <Sequence from={467} durationInFrames={309}>
        <HybridScene />
      </Sequence>
      <Sequence from={776} durationInFrames={274}>
        <FullPipelineScene />
      </Sequence>
    </AbsoluteFill>
  );
}
