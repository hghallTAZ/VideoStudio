/**
 * generate-video-fal.ts - Generate AI videos via fal.ai (Kling, Hailuo, Runway).
 *
 * Usage:
 *   npx tsx scripts/generate-video-fal.ts --prompt "A drone over a city at sunset"
 *   npx tsx scripts/generate-video-fal.ts --prompt "..." --duration 10 --model kling-v3
 *   npx tsx scripts/generate-video-fal.ts --prompt "..." --dry-run
 *   npx tsx scripts/generate-video-fal.ts --prompt "..." --image ./input.jpg
 *   npx tsx scripts/generate-video-fal.ts --list-models
 *
 * Auth: FAL_KEY env var.
 * Budget: integrated with budget.ts - enforces session + month caps.
 */

import * as fs from "fs";
import * as path from "path";
import { fal } from "@fal-ai/client";
import { BudgetTracker } from "./budget";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FAL_KEY = process.env.FAL_KEY;
const OUTPUT_DIR = path.resolve(__dirname, "../out/ai-video");

// ---------------------------------------------------------------------------
// Available models with pricing
// ---------------------------------------------------------------------------

interface ModelDef {
  id: string;
  name: string;
  type: "t2v" | "i2v";
  pricePerSec: number; // USD per second, audio off
  pricePerSecAudio: number;
  durations: number[];
}

const MODELS: ModelDef[] = [
  // Kling V3
  {
    id: "fal-ai/kling-video/v3/standard/text-to-video",
    name: "kling-v3-std-t2v",
    type: "t2v",
    pricePerSec: 0.168,
    pricePerSecAudio: 0.252,
    durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: "fal-ai/kling-video/v3/pro/text-to-video",
    name: "kling-v3-pro-t2v",
    type: "t2v",
    pricePerSec: 0.224,
    pricePerSecAudio: 0.336,
    durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: "fal-ai/kling-video/v3/standard/image-to-video",
    name: "kling-v3-std-i2v",
    type: "i2v",
    pricePerSec: 0.168,
    pricePerSecAudio: 0.252,
    durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  // Kling V2.6 (cheaper)
  {
    id: "fal-ai/kling-video/v2.6/pro/text-to-video",
    name: "kling-v2.6-pro-t2v",
    type: "t2v",
    pricePerSec: 0.07,
    pricePerSecAudio: 0.14,
    durations: [5, 10],
  },
  {
    id: "fal-ai/kling-video/v2.6/pro/image-to-video",
    name: "kling-v2.6-pro-i2v",
    type: "i2v",
    pricePerSec: 0.07,
    pricePerSecAudio: 0.14,
    durations: [5, 10],
  },
];

// Short aliases for CLI convenience
const MODEL_ALIASES: Record<string, string> = {
  "kling-v3": "fal-ai/kling-video/v3/standard/text-to-video",
  "kling-v3-pro": "fal-ai/kling-video/v3/pro/text-to-video",
  "kling-v3-i2v": "fal-ai/kling-video/v3/standard/image-to-video",
  "kling-v2.6": "fal-ai/kling-video/v2.6/pro/text-to-video",
  "kling-v2.6-i2v": "fal-ai/kling-video/v2.6/pro/image-to-video",
};

function resolveModel(input: string): ModelDef {
  const resolvedId = MODEL_ALIASES[input] || input;
  const model = MODELS.find((m) => m.id === resolvedId || m.name === input);
  if (!model) {
    throw new Error(
      `Unknown model: ${input}\nAvailable: ${MODELS.map((m) => m.name).join(", ")}`
    );
  }
  return model;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

interface GenerateOpts {
  prompt: string;
  model: ModelDef;
  duration: number;
  aspectRatio: string;
  audio: boolean;
  imagePath?: string;
  negativePrompt?: string;
}

interface FalVideoResult {
  video: {
    url: string;
    file_name: string;
    file_size: number;
    content_type: string;
  };
}

async function generateVideo(opts: GenerateOpts): Promise<FalVideoResult> {
  if (!FAL_KEY) {
    throw new Error("FAL_KEY not set. Get one at https://fal.ai/dashboard/keys");
  }

  fal.config({ credentials: FAL_KEY });

  const input: Record<string, unknown> = {
    prompt: opts.prompt,
    duration: String(opts.duration),
    aspect_ratio: opts.aspectRatio,
    generate_audio: opts.audio,
  };

  if (opts.negativePrompt) {
    input.negative_prompt = opts.negativePrompt;
  }

  // Image-to-video: upload image first
  if (opts.imagePath) {
    const imageBuffer = fs.readFileSync(opts.imagePath);
    const blob = new Blob([imageBuffer]);
    const imageUrl = await fal.storage.upload(blob);
    input.start_image_url = imageUrl;
  }

  console.log(`  Submitting to fal.ai (${opts.model.name})...`);

  const result = await fal.subscribe(opts.model.id, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_QUEUE") {
        process.stdout.write("  Queued...");
      } else if (update.status === "IN_PROGRESS") {
        process.stdout.write(".");
      }
    },
  });

  console.log(" done!");
  return result.data as FalVideoResult;
}

async function downloadVideo(url: string, outputPath: string): Promise<void> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const has = (flag: string) => args.includes(flag);

  return {
    prompt: get("--prompt") || "",
    model: get("--model") || "kling-v3",
    duration: parseInt(get("--duration") || "5", 10),
    aspectRatio: get("--aspect") || "16:9",
    image: get("--image"),
    output: get("--output"),
    audio: has("--audio"),
    dryRun: has("--dry-run"),
    force: has("--force"),
    negativePrompt: get("--negative"),
    listModels: has("--list-models"),
  };
}

async function main() {
  const opts = parseArgs();

  if (opts.listModels) {
    console.log("\n=== Available Models ===\n");
    console.log("  Alias            | $/sec (no audio) | $/sec (audio) | Durations");
    console.log("  -----------------+------------------+---------------+----------");
    for (const m of MODELS) {
      const alias = Object.entries(MODEL_ALIASES).find(([, v]) => v === m.id)?.[0] || m.name;
      console.log(
        `  ${alias.padEnd(18)}| $${m.pricePerSec.toFixed(3).padEnd(16)}| $${m.pricePerSecAudio.toFixed(3).padEnd(13)}| ${m.durations.join(",")}s`
      );
    }
    console.log("\n  Use --model <alias> to select.\n");
    return;
  }

  if (!opts.prompt) {
    console.error("Usage: npx tsx scripts/generate-video-fal.ts --prompt \"...\"");
    console.error("\nOptions:");
    console.error("  --prompt TEXT         Video description (required)");
    console.error("  --model NAME         Model alias (default: kling-v3)");
    console.error("  --duration 5         Seconds (default: 5)");
    console.error("  --aspect 16:9        Aspect ratio (default: 16:9)");
    console.error("  --image PATH         Start frame for image-to-video");
    console.error("  --audio              Generate with audio");
    console.error("  --output PATH        Output file path");
    console.error("  --dry-run            Show cost estimate only");
    console.error("  --force              Override budget caps");
    console.error("  --list-models        Show available models + pricing");
    process.exit(1);
  }

  // Resolve model, auto-switch to i2v if image provided
  let modelName = opts.model;
  if (opts.image && !modelName.includes("i2v")) {
    modelName = modelName + "-i2v";
  }
  const model = resolveModel(modelName);

  // Cost estimation
  const pricePerSec = opts.audio ? model.pricePerSecAudio : model.pricePerSec;
  const costUsd = pricePerSec * opts.duration;

  const budget = new BudgetTracker();

  console.log("\n=== fal.ai Video Generator ===\n");
  console.log(`  Prompt:    ${opts.prompt.slice(0, 80)}${opts.prompt.length > 80 ? "..." : ""}`);
  console.log(`  Model:     ${model.name} (${model.id})`);
  console.log(`  Duration:  ${opts.duration}s`);
  console.log(`  Aspect:    ${opts.aspectRatio}`);
  console.log(`  Audio:     ${opts.audio}`);
  console.log(`  Est. cost: $${costUsd.toFixed(4)}`);
  if (opts.image) console.log(`  Image:     ${opts.image}`);
  console.log();

  if (opts.dryRun) {
    budget.printSummary();
    return;
  }

  // Budget check
  budget.checkBudget(costUsd, `fal.ai ${model.name} ${opts.duration}s`, opts.force);

  // Generate
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const result = await generateVideo({
    prompt: opts.prompt,
    model,
    duration: opts.duration,
    aspectRatio: opts.aspectRatio,
    audio: opts.audio,
    imagePath: opts.image,
    negativePrompt: opts.negativePrompt,
  });

  // Download
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = opts.output || path.join(
    OUTPUT_DIR,
    `fal-${model.name}-${timestamp}.mp4`
  );

  console.log(`  Downloading to ${outputPath}...`);
  await downloadVideo(result.video.url, outputPath);

  // Record spend
  budget.recordSpend({
    category: "video",
    provider: "fal-ai",
    model: model.id,
    description: opts.prompt.slice(0, 100),
    costUsd,
    durationSec: opts.duration,
    inputParams: {
      aspectRatio: opts.aspectRatio,
      audio: opts.audio,
      hasImage: !!opts.image,
    },
  });

  console.log(`\n  Video saved: ${outputPath}`);
  console.log(`  Cost: $${costUsd.toFixed(4)}`);
  budget.printSummary();
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
