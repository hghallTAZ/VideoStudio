/**
 * TerminalDemo - Fake CLI session showing the ECA pipeline in action.
 *
 * Terminal typing effect with realistic command output,
 * progress bars, and ASCII art logo.
 *
 * 39s @ 30fps = 1170 frames
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
import { colors, fonts } from "../components";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Cursor({ visible }: { visible: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 20,
        backgroundColor: visible ? colors.success : "transparent",
        marginLeft: 2,
        verticalAlign: "text-bottom",
      }}
    />
  );
}

function TypedText({
  text,
  startFrame,
  charsPerFrame = 0.8,
  color = colors.foreground,
}: {
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const visibleChars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const showCursor = visibleChars < text.length && elapsed > 0;

  return (
    <span style={{ color }}>
      {text.slice(0, visibleChars)}
      {showCursor && <Cursor visible={frame % 16 < 8} />}
    </span>
  );
}

function ProgressBar({
  progress,
  width = 40,
  label,
}: {
  progress: number;
  width?: number;
  label?: string;
}) {
  const filled = Math.floor(progress * width);
  const empty = width - filled;
  const pct = Math.floor(progress * 100);

  return (
    <span>
      <span style={{ color: colors.muted }}>[</span>
      <span style={{ color: colors.success }}>{"█".repeat(filled)}</span>
      <span style={{ color: colors.muted }}>{"░".repeat(empty)}</span>
      <span style={{ color: colors.muted }}>]</span>
      <span style={{ color: colors.amber }}> {pct}%</span>
      {label && <span style={{ color: colors.muted }}> {label}</span>}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ASCII Logo
// ---------------------------------------------------------------------------

const ASCII_LOGO = `
 ███████╗ ██████╗ █████╗
 ██╔════╝██╔════╝██╔══██╗
 █████╗  ██║     ███████║
 ██╔══╝  ██║     ██╔══██║
 ███████╗╚██████╗██║  ██║
 ╚══════╝ ╚═════╝╚═╝  ╚═╝
`.trim();

function AsciiLogoScene() {
  const frame = useCurrentFrame();
  const lines = ASCII_LOGO.split("\n");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: fonts.mono,
      }}
    >
      <div style={{ textAlign: "center" }}>
        {lines.map((line, i) => {
          const delay = i * 5;
          const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                color: colors.primary,
                fontSize: 28,
                lineHeight: "32px",
                whiteSpace: "pre",
                textShadow: `0 0 20px ${colors.primary}60`,
              }}
            >
              {line}
            </div>
          );
        })}
        <div
          style={{
            marginTop: 24,
            fontSize: 14,
            color: colors.muted,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Triage Accelerator v2.8.0
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Terminal Session
// ---------------------------------------------------------------------------

interface TermLine {
  type: "prompt" | "output" | "progress" | "blank" | "success" | "error" | "header";
  text?: string;
  delay: number; // frame offset within scene
  progressAt?: number; // for progress lines: 0-1 based on frame
}

// Delays scaled ~1.92x to fill 39s video and align with non-overlapping audio tracks.
// Audio sections (absolute frames): logo 15-109, ingest 130-381, extract 400-628,
// triage 645-906, results 925-1118. Terminal scene starts at frame 110.
const SESSION: TermLine[] = [
  { type: "prompt", text: "eca ingest --matter \"Acme v. Globex\" --path ./discovery/", delay: 0 },
  { type: "blank", delay: 77 },
  { type: "header", text: "  INGEST PIPELINE", delay: 86 },
  { type: "output", text: "  Scanning directory... 12,847 files (98.3 GB)", delay: 106 },
  { type: "output", text: "  Deduplicating (SHA-256)...", delay: 134 },
  { type: "progress", text: "  Dedup", delay: 144, progressAt: 230 },
  { type: "success", text: "  ✓ 4,231 duplicates removed (41.2 GB saved)", delay: 250 },
  { type: "blank", delay: 259 },
  { type: "output", text: "  Extracting text (50+ formats)...", delay: 269 },
  { type: "progress", text: "  Extract", delay: 278, progressAt: 384 },
  { type: "success", text: "  ✓ 8,616 documents processed", delay: 403 },
  { type: "output", text: "    - 342 PDFs with OCR (Tesseract + Gemini hard lane)", delay: 422 },
  { type: "output", text: "    - 1,204 emails with attachments", delay: 442 },
  { type: "output", text: "    - 89 audio/video files transcribed", delay: 461 },
  { type: "blank", delay: 480 },
  { type: "header", text: "  AI TRIAGE", delay: 490 },
  { type: "output", text: "  Generating embeddings (text-embedding-3-small)...", delay: 509 },
  { type: "progress", text: "  Embed", delay: 518, progressAt: 634 },
  { type: "success", text: "  ✓ 24,891 chunks embedded", delay: 653 },
  { type: "blank", delay: 662 },
  { type: "output", text: "  Running hybrid search (BM25 + vector + RRF)...", delay: 672 },
  { type: "progress", text: "  Search", delay: 682, progressAt: 768 },
  { type: "success", text: "  ✓ 2,104 potentially responsive (P@10: 48%)", delay: 787 },
  { type: "blank", delay: 797 },
  { type: "header", text: "  RESULTS", delay: 806 },
  { type: "output", text: "  ┌─────────────────────────────────────────┐", delay: 826 },
  { type: "output", text: "  │  Input:     12,847 files  (98.3 GB)     │", delay: 835 },
  { type: "output", text: "  │  Output:     2,104 files  ( 4.8 GB)     │", delay: 845 },
  { type: "output", text: "  │  Reduction:  95.1%                      │", delay: 854 },
  { type: "output", text: "  │  Time:       18m 12s                    │", delay: 864 },
  { type: "output", text: "  │  Audit:      SHA-256 chain verified ✓   │", delay: 874 },
  { type: "output", text: "  └─────────────────────────────────────────┘", delay: 883 },
  { type: "blank", delay: 893 },
  { type: "prompt", text: "eca export --format relativity --load-file", delay: 912 },
  { type: "success", text: "  ✓ Load file generated: acme-v-globex.dat (2,104 docs)", delay: 989 },
  { type: "success", text: "  ✓ Ready for Relativity import", delay: 1008 },
];

function TerminalSessionScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 60,
        fontFamily: fonts.mono,
        fontSize: 15,
        lineHeight: "24px",
      }}
    >
      {/* Terminal chrome */}
      <div
        style={{
          backgroundColor: "#111111",
          borderRadius: 12,
          border: `1px solid ${colors.muted}30`,
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 36,
            backgroundColor: "#1a1a1a",
            borderBottom: `1px solid ${colors.muted}20`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
          <span style={{ color: colors.muted, fontSize: 12, marginLeft: 12 }}>
            eca-triage -- zsh -- 120x40
          </span>
        </div>

        {/* Terminal content */}
        <div style={{ padding: "20px 24px", overflow: "hidden" }}>
          {SESSION.map((line, i) => {
            if (frame < line.delay) return null;

            const lineOpacity = interpolate(frame - line.delay, [0, 3], [0, 1], {
              extrapolateRight: "clamp",
            });

            if (line.type === "blank") {
              return <div key={i} style={{ height: 24 }} />;
            }

            if (line.type === "progress" && line.progressAt) {
              const progress = interpolate(frame, [line.delay, line.progressAt], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ opacity: lineOpacity }}>
                  <ProgressBar progress={progress} label={line.text} />
                </div>
              );
            }

            const colorMap: Record<string, string> = {
              prompt: colors.success,
              output: colors.foreground,
              success: colors.success,
              error: "#ff5f57",
              header: colors.amber,
            };

            return (
              <div key={i} style={{ opacity: lineOpacity, whiteSpace: "pre" }}>
                {line.type === "prompt" && (
                  <span style={{ color: colors.primary }}>❯ </span>
                )}
                {line.type === "prompt" ? (
                  <TypedText
                    text={line.text || ""}
                    startFrame={line.delay}
                    color={colorMap[line.type]}
                  />
                ) : (
                  <span
                    style={{
                      color: colorMap[line.type],
                      fontWeight: line.type === "header" ? 800 : 400,
                      letterSpacing: line.type === "header" ? "0.15em" : undefined,
                    }}
                  >
                    {line.text}
                  </span>
                )}
              </div>
            );
          })}

          {/* Blinking cursor at end */}
          {frame > 1020 && (
            <div>
              <span style={{ color: colors.primary }}>❯ </span>
              <Cursor visible={frame % 20 < 10} />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function TerminalDemo() {
  // Audio durations (measured via ffprobe @ 30fps):
  // terminal-01: 94, terminal-02: 251, terminal-03: 228, terminal-04: 261, terminal-05: 193
  // FIXED: ALL 4 transitions had massive overlap (81-108 frames each!)
  // Total audio: 1027 frames (34.2s) - original video was only 750 (25s)
  // Extended to 1170 frames (39s) with proper spacing
  return (
    <AbsoluteFill>
      {/* Narration - non-overlapping, capped */}
      <Sequence from={15} durationInFrames={94}>
        <Audio src={staticFile("audio/terminal-01-logo.mp3")} />
      </Sequence>
      <Sequence from={130} durationInFrames={251}>
        <Audio src={staticFile("audio/terminal-02-ingest.mp3")} />
      </Sequence>
      <Sequence from={400} durationInFrames={228}>
        <Audio src={staticFile("audio/terminal-03-extract.mp3")} />
      </Sequence>
      <Sequence from={645} durationInFrames={261}>
        <Audio src={staticFile("audio/terminal-04-triage.mp3")} />
      </Sequence>
      <Sequence from={925} durationInFrames={193}>
        <Audio src={staticFile("audio/terminal-05-results.mp3")} />
      </Sequence>

      {/* Scenes */}
      <Sequence from={0} durationInFrames={120}>
        <AsciiLogoScene />
      </Sequence>
      <Sequence from={110} durationInFrames={1060}>
        <TerminalSessionScene />
      </Sequence>
    </AbsoluteFill>
  );
}
