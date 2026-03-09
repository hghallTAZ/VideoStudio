/**
 * generate-video.ts - Generate AI videos via Kling's direct API.
 *
 * Usage:
 *   npx tsx scripts/generate-video.ts --prompt "A drone over a city at sunset"
 *   npx tsx scripts/generate-video.ts --prompt "..." --duration 10 --mode pro
 *   npx tsx scripts/generate-video.ts --prompt "..." --dry-run
 *   npx tsx scripts/generate-video.ts --prompt "..." --image ./input.jpg
 *   npx tsx scripts/generate-video.ts --prompt "..." --audio  # generate with audio
 *   npx tsx scripts/generate-video.ts --status <task_id>      # check status
 *
 * Auth: KLING_ACCESS_KEY + KLING_SECRET_KEY env vars (or .env file).
 * Budget: integrated with budget.ts - enforces session + month caps.
 */

import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import { BudgetTracker } from "./budget";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.klingai.com";

const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY;
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY;

const OUTPUT_DIR = path.resolve(__dirname, "../out/ai-video");
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 300_000; // 5 minutes

// Kling pricing: units per second, $0.14/unit
const UNIT_PRICE_USD = 0.14;

interface PricingTier {
  unitsPerSec: number;
  label: string;
}

// Pricing table: model -> mode -> audio -> units per second
const PRICING: Record<string, PricingTier> = {
  "v3-std":           { unitsPerSec: 0.6,  label: "V3 Std (no audio)" },
  "v3-std-audio":     { unitsPerSec: 0.9,  label: "V3 Std (audio)" },
  "v3-pro":           { unitsPerSec: 1.2,  label: "V3 Pro (no audio)" },
  "v3-pro-audio":     { unitsPerSec: 1.4,  label: "V3 Pro (audio)" },
  "v3-omni-std":      { unitsPerSec: 0.6,  label: "V3 Omni Std (no audio)" },
  "v3-omni-std-audio":{ unitsPerSec: 0.8,  label: "V3 Omni Std (audio)" },
  "v3-omni-pro":      { unitsPerSec: 1.0,  label: "V3 Omni Pro (no audio)" },
  "v3-omni-pro-audio":{ unitsPerSec: 1.2,  label: "V3 Omni Pro (audio)" },
  "v2.6-std-5":       { unitsPerSec: 0.3,  label: "V2.6 Std 5s" },
  "v2.6-std-10":      { unitsPerSec: 0.3,  label: "V2.6 Std 10s" },
  "v2.6-pro-5":       { unitsPerSec: 0.5,  label: "V2.6 Pro 5s" },
  "v2.6-pro-10":      { unitsPerSec: 0.5,  label: "V2.6 Pro 10s" },
};

// Model name mapping for the API
const MODEL_NAMES: Record<string, string> = {
  "v3": "kling-v3",
  "v2.6": "kling-v2-6",
  "v1.6": "kling-v1-6",
  "v2.1": "kling-v2-1-master",
  "v2-master": "kling-v2-master",
};

// ---------------------------------------------------------------------------
// Auth - JWT generation
// ---------------------------------------------------------------------------

function generateJWT(): string {
  if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
    throw new Error(
      "KLING_ACCESS_KEY and KLING_SECRET_KEY must be set.\n" +
      "Get them from: https://app.klingai.com/global/dev/api-key"
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: KLING_ACCESS_KEY,
    exp: now + 1800,  // 30 min TTL
    nbf: now - 5,     // 5s clock skew tolerance
  };

  return jwt.sign(payload, KLING_SECRET_KEY, {
    algorithm: "HS256",
    header: { alg: "HS256", typ: "JWT" },
  });
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${generateJWT()}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Cost estimation
// ---------------------------------------------------------------------------

function estimateCost(
  model: string,
  mode: string,
  duration: number,
  audio: boolean
): { costUsd: number; tier: PricingTier } {
  const key = model === "v3"
    ? `v3-${mode}${audio ? "-audio" : ""}`
    : `${model}-${mode}-${duration}`;

  const tier = PRICING[key] || PRICING["v3-std"];
  const costUsd = tier.unitsPerSec * duration * UNIT_PRICE_USD;
  return { costUsd, tier };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

interface CreateTaskResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: string;
  };
}

interface QueryTaskResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: string;
    task_status_msg: string;
    task_result?: {
      videos?: Array<{
        id: string;
        url: string;
        duration: string;
      }>;
    };
  };
}

async function createTextToVideo(opts: {
  prompt: string;
  model: string;
  mode: string;
  duration: number;
  aspectRatio: string;
  negativePrompt?: string;
}): Promise<CreateTaskResponse> {
  const body: Record<string, unknown> = {
    model_name: MODEL_NAMES[opts.model] || opts.model,
    prompt: opts.prompt,
    mode: opts.mode,
    aspect_ratio: opts.aspectRatio,
    duration: String(opts.duration),
  };
  if (opts.negativePrompt) body.negative_prompt = opts.negativePrompt;

  const resp = await fetch(`${BASE_URL}/v1/videos/text2video`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await resp.json() as CreateTaskResponse;
  if (json.code !== 0) {
    throw new Error(`Kling API error: ${json.message} (code ${json.code})`);
  }
  return json;
}

async function createImageToVideo(opts: {
  prompt: string;
  imagePath: string;
  model: string;
  mode: string;
  duration: number;
}): Promise<CreateTaskResponse> {
  const imageBuffer = fs.readFileSync(opts.imagePath);
  const imageBase64 = imageBuffer.toString("base64");

  const body: Record<string, unknown> = {
    model_name: MODEL_NAMES[opts.model] || opts.model,
    image: imageBase64,
    prompt: opts.prompt,
    mode: opts.mode,
    duration: String(opts.duration),
  };

  const resp = await fetch(`${BASE_URL}/v1/videos/image2video`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await resp.json() as CreateTaskResponse;
  if (json.code !== 0) {
    throw new Error(`Kling API error: ${json.message} (code ${json.code})`);
  }
  return json;
}

async function queryTask(
  endpoint: string,
  taskId: string
): Promise<QueryTaskResponse> {
  const resp = await fetch(`${BASE_URL}${endpoint}/${taskId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return (await resp.json()) as QueryTaskResponse;
}

async function pollUntilDone(
  endpoint: string,
  taskId: string
): Promise<string> {
  const start = Date.now();
  process.stdout.write("  Generating");

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    process.stdout.write(".");

    const result = await queryTask(endpoint, taskId);
    const status = result.data.task_status;

    if (status === "succeed") {
      console.log(" done!");
      const videos = result.data.task_result?.videos;
      if (!videos || videos.length === 0) {
        throw new Error("Task succeeded but no videos in result");
      }
      return videos[0].url;
    }

    if (status === "failed") {
      console.log(" failed!");
      throw new Error(
        `Generation failed: ${result.data.task_status_msg || "unknown error"}`
      );
    }
  }

  throw new Error(`Timed out after ${POLL_TIMEOUT_MS / 1000}s`);
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
    model: get("--model") || "v3",
    mode: get("--mode") || "std",
    duration: parseInt(get("--duration") || "5", 10),
    aspectRatio: get("--aspect") || "16:9",
    image: get("--image"),
    output: get("--output"),
    audio: has("--audio"),
    dryRun: has("--dry-run"),
    force: has("--force"),
    status: get("--status"),
    negativePrompt: get("--negative"),
  };
}

async function main() {
  const opts = parseArgs();

  // Status check mode
  if (opts.status) {
    console.log(`\nChecking task: ${opts.status}`);
    const endpoint = "/v1/videos/text2video"; // works for both
    const result = await queryTask(endpoint, opts.status);
    console.log(JSON.stringify(result.data, null, 2));
    return;
  }

  if (!opts.prompt) {
    console.error("Usage: npx tsx scripts/generate-video.ts --prompt \"...\"");
    console.error("\nOptions:");
    console.error("  --prompt TEXT      Video description (required)");
    console.error("  --model v3|v2.6   Model version (default: v3)");
    console.error("  --mode std|pro    Quality mode (default: std)");
    console.error("  --duration 5|10   Seconds (default: 5)");
    console.error("  --aspect 16:9     Aspect ratio (default: 16:9)");
    console.error("  --image PATH      Start frame for image-to-video");
    console.error("  --audio           Generate with audio");
    console.error("  --output PATH     Output file path");
    console.error("  --dry-run         Show cost estimate only");
    console.error("  --force           Override budget caps");
    console.error("  --status TASK_ID  Check generation status");
    process.exit(1);
  }

  // Cost estimation
  const { costUsd, tier } = estimateCost(
    opts.model, opts.mode, opts.duration, opts.audio
  );

  const budget = new BudgetTracker();

  console.log("\n=== Kling Video Generator ===\n");
  console.log(`  Prompt:    ${opts.prompt.slice(0, 80)}${opts.prompt.length > 80 ? "..." : ""}`);
  console.log(`  Model:     ${MODEL_NAMES[opts.model] || opts.model}`);
  console.log(`  Mode:      ${opts.mode}`);
  console.log(`  Duration:  ${opts.duration}s`);
  console.log(`  Aspect:    ${opts.aspectRatio}`);
  console.log(`  Audio:     ${opts.audio}`);
  console.log(`  Tier:      ${tier.label}`);
  console.log(`  Est. cost: $${costUsd.toFixed(4)}`);
  if (opts.image) console.log(`  Image:     ${opts.image}`);
  console.log();

  if (opts.dryRun) {
    budget.printSummary();
    return;
  }

  // Budget check
  budget.checkBudget(costUsd, `${tier.label} ${opts.duration}s`, opts.force);

  // Generate
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const isI2V = !!opts.image;
  const endpoint = isI2V ? "/v1/videos/image2video" : "/v1/videos/text2video";

  console.log(`  Submitting ${isI2V ? "image-to-video" : "text-to-video"} task...`);

  let result: CreateTaskResponse;
  if (isI2V) {
    result = await createImageToVideo({
      prompt: opts.prompt,
      imagePath: opts.image!,
      model: opts.model,
      mode: opts.mode,
      duration: opts.duration,
    });
  } else {
    result = await createTextToVideo({
      prompt: opts.prompt,
      model: opts.model,
      mode: opts.mode,
      duration: opts.duration,
      aspectRatio: opts.aspectRatio,
      negativePrompt: opts.negativePrompt,
    });
  }

  const taskId = result.data.task_id;
  console.log(`  Task ID: ${taskId}`);

  // Poll until done
  const videoUrl = await pollUntilDone(endpoint, taskId);

  // Download
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = opts.output || path.join(
    OUTPUT_DIR,
    `kling-${opts.model}-${timestamp}.mp4`
  );

  console.log(`  Downloading to ${outputPath}...`);
  await downloadVideo(videoUrl, outputPath);

  // Record spend
  budget.recordSpend({
    category: "video",
    provider: "kling-direct",
    model: MODEL_NAMES[opts.model] || opts.model,
    description: opts.prompt.slice(0, 100),
    costUsd,
    durationSec: opts.duration,
    inputParams: {
      mode: opts.mode,
      aspectRatio: opts.aspectRatio,
      audio: opts.audio,
      isI2V,
    },
  });

  console.log(`\n  Video saved: ${outputPath}`);
  console.log(`  Cost: $${costUsd.toFixed(4)}`);
  console.log(`  CDN URL (expires ~30 days): ${videoUrl}`);
  budget.printSummary();
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
