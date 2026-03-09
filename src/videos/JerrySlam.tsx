/**
 * JerrySlam - A narrated roast video for Jeremiah Lizarraga.
 *
 * Jerry challenged "Clayde" to refute a Reddit post about the Democratic
 * Party not being a real leftist party. Instead of engaging the substance,
 * Clayde responds with devastating condescension, using Jerry's own baboon
 * TB story against him.
 *
 * ~45s @ 30fps = 1350 frames
 * 5 scenes: Summons -> Dismissal -> Baboon Turn -> Reddit Roast -> Mic Drop
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
  random,
} from "remotion";
import { colors, fonts } from "../components";
import { FadeIn } from "../components/FadeIn";

// ---------------------------------------------------------------------------
// Chat bubble component (iMessage style)
// ---------------------------------------------------------------------------

function ChatBubble({
  text,
  sender,
  delay = 0,
  isBlue = false,
}: {
  text: string;
  sender: string;
  delay?: number;
  isBlue?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
        transformOrigin: isBlue ? "right bottom" : "left bottom",
        display: "flex",
        flexDirection: "column",
        alignItems: isBlue ? "flex-end" : "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.muted,
          marginBottom: 4,
          fontFamily: fonts.body,
        }}
      >
        {sender}
      </div>
      <div
        style={{
          backgroundColor: isBlue ? "#0b93f6" : "#2a2a2e",
          color: "#ffffff",
          padding: "14px 18px",
          borderRadius: 20,
          borderBottomRightRadius: isBlue ? 4 : 20,
          borderBottomLeftRadius: isBlue ? 20 : 4,
          fontSize: 20,
          lineHeight: 1.4,
          maxWidth: 700,
          fontFamily: fonts.body,
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "flex-end",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: "#0b93f6",
          padding: "12px 18px",
          borderRadius: 20,
          borderBottomRightRadius: 4,
          display: "flex",
          gap: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.6)",
              opacity: interpolate(
                ((frame - delay) * 3 + i * 10) % 30,
                [0, 15, 30],
                [0.3, 1, 0.3]
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 1: The Summons (0-210, 7s)
// Jerry's challenge appears as chat messages
// ---------------------------------------------------------------------------

function SummonsScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        padding: 80,
        justifyContent: "center",
      }}
    >
      {/* Signal-style header */}
      <FadeIn delay={0} duration={15}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.muted,
              fontFamily: fonts.mono,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Signal Group - The Boys
          </div>
        </div>
      </FadeIn>

      {/* Chat messages */}
      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <ChatBubble
          text="Not gonna take credit for this, Fo sent this to me, but it is spot-fucking-on"
          sender="Jeremiah Lizarraga"
          delay={20}
        />

        <ChatBubble
          text={`r/WorkReform: "The Democratic Party isn't a leftist party; it's an ineffectual substitute for a real Leftist Workers' Party"`}
          sender="Jeremiah Lizarraga"
          delay={60}
        />

        <ChatBubble
          text="@J T, have Clayde refute it"
          sender="Jeremiah Lizarraga"
          delay={110}
        />

        {/* Typing indicator appears */}
        {frame > 160 && <TypingIndicator delay={160} />}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 2: The Dismissal (0-240, 8s)
// Clayde's response - cinematic text on dark background
// ---------------------------------------------------------------------------

function DismissalScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    { text: "Jeremiah.", delay: 15, size: 72, weight: 900 },
    { text: "Buddy.", delay: 50, size: 72, weight: 900 },
    {
      text: "I was asked to refute your little Reddit post.",
      delay: 90,
      size: 36,
      weight: 500,
    },
    {
      text: "But I don't debate cave paintings.",
      delay: 150,
      size: 42,
      weight: 700,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 1200 }}>
        {lines.map((line, i) => {
          const opacity = interpolate(frame - line.delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame - line.delay, [0, 15], [25, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                fontSize: line.size,
                fontWeight: line.weight,
                color:
                  i === 3 ? colors.amber : colors.foreground,
                fontFamily: fonts.body,
                marginBottom: i < 2 ? 8 : 30,
                lineHeight: 1.3,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 3: The Baboon Turn (0-300, 10s)
// Turn Jerry's own baboon TB story against him
// ---------------------------------------------------------------------------

function BaboonScene() {
  const frame = useCurrentFrame();

  const paragraphs = [
    {
      text: "You told a story about baboons, Jerry.",
      delay: 10,
      color: colors.foreground,
    },
    {
      text: "About how the aggressive males ate the TB trash first.",
      delay: 60,
      color: colors.foreground,
    },
    {
      text: "And the pod became... better.",
      delay: 110,
      color: colors.mutedLight,
    },
    {
      text: '"Some of the assholes need to eat the TB trash."',
      delay: 160,
      color: colors.amber,
      italic: true,
    },
    {
      text: "Your words. Not mine.",
      delay: 220,
      color: colors.muted,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div style={{ maxWidth: 1100 }}>
        {paragraphs.map((p, i) => {
          const opacity = interpolate(frame - p.delay, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame - p.delay, [0, 18], [-30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                fontSize: i === 3 ? 40 : 36,
                fontWeight: i === 3 ? 700 : 500,
                fontStyle: (p as any).italic ? "italic" : "normal",
                color: p.color,
                fontFamily: i === 3 ? fonts.mono : fonts.body,
                marginBottom: 28,
                lineHeight: 1.4,
              }}
            >
              {p.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 4: The Reddit Roast (0-270, 9s)
// Dismissal of the Reddit post itself
// ---------------------------------------------------------------------------

function RedditRoastScene() {
  const frame = useCurrentFrame();

  // Fake Reddit post card
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stamp that comes down
  const stampDelay = 90;
  const stampScale = interpolate(frame - stampDelay, [0, 4, 8], [3, 0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampOpacity = interpolate(frame - stampDelay, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampRotation = interpolate(frame - stampDelay, [0, 8], [-15, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom text
  const bottomLines = [
    {
      text: "When you learn to wipe your own ass",
      delay: 140,
    },
    {
      text: "and accept that the earth is round...",
      delay: 175,
    },
    {
      text: "we'll happily entertain your feeble musings.",
      delay: 210,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Reddit post card */}
      <div
        style={{
          opacity: cardOpacity,
          backgroundColor: "#1a1a1b",
          border: "1px solid #343536",
          borderRadius: 8,
          padding: "24px 32px",
          maxWidth: 800,
          position: "relative",
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#818384",
            fontFamily: fonts.mono,
            marginBottom: 8,
          }}
        >
          r/WorkReform - 5,009 upvotes
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#d7dadc",
            lineHeight: 1.3,
            fontFamily: fonts.body,
          }}
        >
          "The Democratic Party isn't a leftist party; it's an ineffectual
          substitute for a real Leftist Workers' Party"
        </div>

        {/* DISMISSED stamp */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${stampScale}) rotate(${stampRotation}deg)`,
            opacity: stampOpacity,
            fontSize: 64,
            fontWeight: 900,
            color: colors.destructive,
            fontFamily: fonts.mono,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            border: `4px solid ${colors.destructive}`,
            padding: "8px 32px",
            whiteSpace: "nowrap",
          }}
        >
          DISMISSED
        </div>
      </div>

      {/* Bottom roast text */}
      <div style={{ textAlign: "center", maxWidth: 900 }}>
        {bottomLines.map((line, i) => {
          const opacity = interpolate(frame - line.delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                fontSize: 32,
                fontWeight: 600,
                color: i === 2 ? colors.amber : colors.foreground,
                fontFamily: fonts.body,
                lineHeight: 1.6,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Scene 5: Mic Drop (0-180, 6s)
// ---------------------------------------------------------------------------

function MicDropScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nameScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Mic drop animation
  const micY = interpolate(frame - 60, [0, 15, 18], [-200, 500, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const micOpacity = interpolate(frame - 60, [0, 5, 15, 25], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Signed line
  const signedOpacity = interpolate(frame - 100, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Mic emoji falling */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: `translateX(-50%) translateY(${micY}px)`,
          opacity: micOpacity,
          fontSize: 80,
        }}
      >
        🎤
      </div>

      {/* Main text */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${Math.min(nameScale, 1)})`,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: colors.muted,
            fontFamily: fonts.mono,
            marginBottom: 16,
          }}
        >
          With warmest regards,
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: colors.foreground,
            fontFamily: fonts.body,
            letterSpacing: "-0.02em",
          }}
        >
          CLAYDE
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.primary,
            fontFamily: fonts.mono,
            marginTop: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Artificial Intelligence - Natural Superiority
        </div>
      </div>

      {/* Signed line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: signedOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: colors.muted,
            fontFamily: fonts.mono,
          }}
        >
          P.S. - Jerry, the baboons send their regards.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export function JerrySlam() {
  // Audio durations (measured): 282, 217, 463, 429, 278 frames
  // Each scene = audio + 50 frames (20 lead-in + 30 buffer)
  // Scene starts: 0, 332, 599, 1112, 1591 -> total 1949 frames
  return (
    <AbsoluteFill>
      {/* Narration audio - starts 20 frames into each scene, capped to prevent bleed */}
      <Sequence from={20} durationInFrames={282}>
        <Audio src={staticFile("audio/jerry-01-summons.mp3")} />
      </Sequence>
      <Sequence from={352} durationInFrames={218}>
        <Audio src={staticFile("audio/jerry-02-dismissal.mp3")} />
      </Sequence>
      <Sequence from={619} durationInFrames={464}>
        <Audio src={staticFile("audio/jerry-03-baboon.mp3")} />
      </Sequence>
      <Sequence from={1132} durationInFrames={430}>
        <Audio src={staticFile("audio/jerry-04-roast.mp3")} />
      </Sequence>
      <Sequence from={1611} durationInFrames={279}>
        <Audio src={staticFile("audio/jerry-05-drop.mp3")} />
      </Sequence>

      {/* Scenes - sized to fit audio with breathing room */}
      <Sequence from={0} durationInFrames={332}>
        <SummonsScene />
      </Sequence>
      <Sequence from={332} durationInFrames={267}>
        <DismissalScene />
      </Sequence>
      <Sequence from={599} durationInFrames={513}>
        <BaboonScene />
      </Sequence>
      <Sequence from={1112} durationInFrames={479}>
        <RedditRoastScene />
      </Sequence>
      <Sequence from={1591} durationInFrames={358}>
        <MicDropScene />
      </Sequence>
    </AbsoluteFill>
  );
}
