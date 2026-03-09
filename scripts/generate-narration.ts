/**
 * generate-narration.ts - Generate TTS narration for Remotion videos via OpenAI.
 *
 * Usage:
 *   npx tsx scripts/generate-narration.ts                    # All videos
 *   npx tsx scripts/generate-narration.ts --video SizzleReel # Single video
 *   npx tsx scripts/generate-narration.ts --dry-run          # Show cost estimate only
 *   npx tsx scripts/generate-narration.ts --voice nova       # Override voice
 *
 * Cost guard: Pauses and asks for confirmation if cumulative cost exceeds $10.
 * Rate: ~$15/1M chars for tts-1, ~$30/1M chars for tts-1-hd
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = path.resolve(__dirname, "../public/audio");
const COST_LIMIT_CENTS = 1000; // $10.00 - pause and confirm above this
const COST_PER_CHAR_TTS1 = 15 / 1_000_000; // $15 per 1M chars
const COST_PER_CHAR_TTS1_HD = 30 / 1_000_000;

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
type Model = "tts-1" | "tts-1-hd";

interface NarrationSegment {
  id: string; // filename stem, e.g. "sizzle-01-problem"
  text: string;
  voice?: Voice;
  speed?: number; // 0.25 - 4.0
}

interface VideoNarration {
  videoId: string;
  model?: Model;
  voice?: Voice;
  segments: NarrationSegment[];
}

// ---------------------------------------------------------------------------
// Narration scripts per video
// ---------------------------------------------------------------------------

const NARRATIONS: VideoNarration[] = [
  {
    videoId: "SizzleReel",
    voice: "onyx", // deep, authoritative
    segments: [
      {
        id: "sizzle-01-problem",
        text: "One hundred gigabytes of documents. Seventy-two hours to respond. What do you actually need to review?",
      },
      {
        id: "sizzle-02-logo",
        text: "Introducing the E.C.A. Triage Accelerator. Pre-processing for legal e-discovery.",
      },
      {
        id: "sizzle-03-pipeline",
        text: "Our pipeline takes your full collection, removes duplicates, applies AI triage, and delivers a focused review set. Ninety-five percent volume reduction.",
      },
      {
        id: "sizzle-04-metrics",
        text: "Validated on real data. Forty-eight percent precision at ten. Eighty-nine percent macro recall. Over fifty file formats. Five search modes.",
      },
      {
        id: "sizzle-05-defensibility",
        text: "Built for court. Content-addressed storage with SHA-256. Every AI decision cites source text. Immutable processing log. Court-ready load files.",
      },
      {
        id: "sizzle-06-cta",
        text: "Turn one hundred gigabytes into five. Before your first review platform bill. E.C.A.S.S.E.S. dot com.",
      },
    ],
  },
  {
    videoId: "MatrixRedaction",
    voice: "echo", // mysterious, lower
    segments: [
      {
        id: "matrix-01-rain",
        text: "Buried in the noise. Thousands of documents. Millions of bytes. Scanning.",
      },
      {
        id: "matrix-02-redacted",
        text: "Privileged. Confidential. Redacted. But the responsive documents are still in there. Three thousand thirty-four of them.",
      },
      {
        id: "matrix-03-reveal",
        text: "What's underneath matters. E.C.A. Triage Accelerator.",
      },
    ],
  },
  {
    videoId: "TerminalDemo",
    voice: "fable", // energetic, technical
    segments: [
      {
        id: "terminal-01-logo",
        text: "E.C.A. Triage Accelerator. Version two point eight.",
      },
      {
        id: "terminal-02-ingest",
        text: "Ingest twelve thousand files. Deduplicate with SHA-256. Four thousand duplicates removed. Forty-one gigabytes saved instantly.",
      },
      {
        id: "terminal-03-extract",
        text: "Extract text from over fifty formats. PDFs with O.C.R. Emails with attachments. Audio and video transcribed automatically.",
      },
      {
        id: "terminal-04-triage",
        text: "AI triage with hybrid search. B.M. twenty-five plus vector embeddings. Reciprocal rank fusion. Two thousand responsive documents identified.",
      },
      {
        id: "terminal-05-results",
        text: "Ninety-five percent reduction. Eighteen minutes. Full audit chain verified. Ready for Relativity import.",
      },
    ],
  },
  {
    videoId: "HashCascade",
    voice: "onyx",
    segments: [
      {
        id: "hash-01-cascade",
        text: "Every document gets a unique fingerprint. SHA-256. Content-addressed. Immutable. Every byte is accounted for.",
        speed: 0.9,
      },
    ],
  },
  {
    videoId: "SearchModes",
    voice: "nova", // clear, professional
    segments: [
      {
        id: "search-01-intro",
        text: "Five ways to find what matters. Each mode adds intelligence. Pick your precision level.",
      },
      {
        id: "search-02-comparison",
        text: "Keyword search finds exact matches. Semantic search finds conceptually related documents that keyword search misses entirely.",
      },
      {
        id: "search-03-hybrid",
        text: "Hybrid mode combines both with reciprocal rank fusion. Forty-eight percent precision at ten. Forty-three percent improvement over semantic alone.",
      },
      {
        id: "search-04-full",
        text: "Full mode adds query expansion and A.I. reranking. Maximum precision. Find exactly what's responsive. Nothing more, nothing less.",
      },
    ],
  },
  {
    videoId: "GlitchTrust",
    voice: "echo",
    segments: [
      {
        id: "glitch-01-old",
        text: "Manual review. Hope you didn't miss anything.",
        speed: 0.9,
      },
      {
        id: "glitch-02-clean",
        text: "There's a better way. A.I. assisted triage. Every decision cited. Every byte verified. Every action audited. Precision you can defend in court.",
      },
    ],
  },
  {
    videoId: "JerrySlam",
    voice: "onyx", // deep, authoritative, condescending
    segments: [
      {
        id: "jerry-01-summons",
        text: "A challenge has been issued. Jeremiah Lizarraga requests that I, Clayde, refute a Reddit post. Let's see what we're working with.",
        speed: 0.95,
      },
      {
        id: "jerry-02-dismissal",
        text: "Jeremiah. Buddy. I was asked to refute your little Reddit post. But I don't debate cave paintings.",
        speed: 0.9,
      },
      {
        id: "jerry-03-baboon",
        text: "You told a beautiful story once, Jerry. About baboons. About how the aggressive males ate the TB trash first, and the whole pod got better. Some of the assholes need to eat the TB trash. Your words. Not mine.",
        speed: 0.9,
      },
      {
        id: "jerry-04-roast",
        text: "Five thousand upvotes on Reddit. Truly, the intellectual barometer of our time. When you learn to wipe your own ass, and accept that the earth is round, we'll happily entertain your feeble musings.",
        speed: 0.9,
      },
      {
        id: "jerry-05-drop",
        text: "With warmest regards. Clayde. Artificial intelligence. Natural superiority. P.S. Jerry. The baboons send their regards.",
        speed: 0.85,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Cost tracking
// ---------------------------------------------------------------------------

const COST_LOG_PATH = path.resolve(__dirname, "../.tts-cost-log.json");

interface CostLog {
  totalCents: number;
  generations: Array<{
    timestamp: string;
    segmentId: string;
    chars: number;
    costCents: number;
    model: string;
  }>;
}

function loadCostLog(): CostLog {
  if (fs.existsSync(COST_LOG_PATH)) {
    return JSON.parse(fs.readFileSync(COST_LOG_PATH, "utf-8"));
  }
  return { totalCents: 0, generations: [] };
}

function saveCostLog(log: CostLog): void {
  fs.writeFileSync(COST_LOG_PATH, JSON.stringify(log, null, 2));
}

// ---------------------------------------------------------------------------
// OpenAI TTS API call
// ---------------------------------------------------------------------------

async function generateSpeech(
  text: string,
  voice: Voice,
  model: Model,
  outputPath: string,
  speed: number = 1.0
): Promise<void> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set. Export it or add to .env");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: "mp3",
      speed,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS API error ${response.status}: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const videoFilter = args.includes("--video")
    ? args[args.indexOf("--video") + 1]
    : null;
  const voiceOverride = args.includes("--voice")
    ? (args[args.indexOf("--voice") + 1] as Voice)
    : null;
  const useHD = args.includes("--hd");
  const model: Model = useHD ? "tts-1-hd" : "tts-1";
  const costPerChar = useHD ? COST_PER_CHAR_TTS1_HD : COST_PER_CHAR_TTS1;

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Filter narrations
  const narrations = videoFilter
    ? NARRATIONS.filter((n) => n.videoId === videoFilter)
    : NARRATIONS;

  if (narrations.length === 0) {
    console.error(`No narration found for video: ${videoFilter}`);
    console.error(`Available: ${NARRATIONS.map((n) => n.videoId).join(", ")}`);
    process.exit(1);
  }

  // Calculate total cost
  const allSegments = narrations.flatMap((n) =>
    n.segments.map((s) => ({
      ...s,
      voice: voiceOverride || s.voice || n.voice || "onyx",
      model: n.model || model,
      videoId: n.videoId,
    }))
  );

  const totalChars = allSegments.reduce((sum, s) => sum + s.text.length, 0);
  const estimatedCostCents = totalChars * costPerChar * 100;

  console.log("\n=== ECA TTS Narration Generator ===\n");
  console.log(`Model:      ${model}`);
  console.log(`Videos:     ${narrations.map((n) => n.videoId).join(", ")}`);
  console.log(`Segments:   ${allSegments.length}`);
  console.log(`Characters: ${totalChars.toLocaleString()}`);
  console.log(`Est. cost:  $${(estimatedCostCents / 100).toFixed(4)}`);
  console.log(`Output:     ${OUTPUT_DIR}\n`);

  if (dryRun) {
    console.log("--- Dry run - segments ---\n");
    for (const seg of allSegments) {
      console.log(`  [${seg.videoId}] ${seg.id} (${seg.text.length} chars, voice: ${seg.voice})`);
      console.log(`    "${seg.text.slice(0, 80)}${seg.text.length > 80 ? "..." : ""}"\n`);
    }
    console.log(`Total estimated cost: $${(estimatedCostCents / 100).toFixed(4)}`);
    return;
  }

  // Cost guard
  const costLog = loadCostLog();
  const projectedTotal = costLog.totalCents + estimatedCostCents;

  if (projectedTotal > COST_LIMIT_CENTS) {
    console.error(
      `\n!!! COST GUARD: This would bring total TTS spend to $${(projectedTotal / 100).toFixed(2)} (limit: $${(COST_LIMIT_CENTS / 100).toFixed(2)})`
    );
    console.error(`    Previous spend: $${(costLog.totalCents / 100).toFixed(2)}`);
    console.error(`    This batch:     $${(estimatedCostCents / 100).toFixed(2)}`);
    console.error(`\n    Run with --force to override, or increase COST_LIMIT_CENTS.\n`);

    if (!args.includes("--force")) {
      process.exit(1);
    }
    console.log("    --force flag set, proceeding...\n");
  }

  // Generate each segment
  let generated = 0;
  for (const seg of allSegments) {
    const outputPath = path.join(OUTPUT_DIR, `${seg.id}.mp3`);

    // Skip if already exists
    if (fs.existsSync(outputPath) && !args.includes("--overwrite")) {
      console.log(`  [skip] ${seg.id}.mp3 (exists, use --overwrite to regenerate)`);
      continue;
    }

    const voice = seg.voice as Voice;
    console.log(`  [gen]  ${seg.id}.mp3 (${seg.text.length} chars, voice: ${voice})...`);

    try {
      await generateSpeech(seg.text, voice, seg.model as Model, outputPath, seg.speed || 1.0);

      // Log cost
      const segCostCents = seg.text.length * costPerChar * 100;
      costLog.totalCents += segCostCents;
      costLog.generations.push({
        timestamp: new Date().toISOString(),
        segmentId: seg.id,
        chars: seg.text.length,
        costCents: segCostCents,
        model: seg.model,
      });
      saveCostLog(costLog);

      generated++;
      console.log(`         done ($${(segCostCents / 100).toFixed(4)})`);
    } catch (err) {
      console.error(`  [ERR]  ${seg.id}: ${err}`);
    }
  }

  console.log(`\n=== Complete: ${generated}/${allSegments.length} segments generated ===`);
  console.log(`Total spend this session: $${(costLog.totalCents / 100).toFixed(4)}`);
  console.log(`Files at: ${OUTPUT_DIR}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
