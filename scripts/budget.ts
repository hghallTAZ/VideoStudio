/**
 * budget.ts - Shared budget tracking for all AI media generation.
 *
 * Tracks spend across TTS, video generation, and music generation.
 * Append-only JSONL ledger + per-session and per-month hard caps.
 *
 * Usage:
 *   import { BudgetTracker } from "./budget"
 *   const budget = new BudgetTracker()
 *   budget.checkBudget(estimatedCost, "fal.ai Kling V3 5s video")
 *   budget.recordSpend({ ... })
 *   budget.printSummary()
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config - adjust these caps as needed
// ---------------------------------------------------------------------------

/** Per-session hard cap in dollars. Generation fails above this. */
export const SESSION_CAP_USD = 25;

/** Per-month soft cap in dollars. Warns but allows override with --force. */
export const MONTH_CAP_USD = 100;

/** Ledger file - append-only JSONL */
const LEDGER_PATH = path.resolve(__dirname, "../budget-ledger.jsonl");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MediaCategory = "tts" | "video" | "music";

export interface SpendEntry {
  timestamp: string;
  category: MediaCategory;
  provider: string;       // e.g. "openai-tts", "fal-ai-kling", "suno"
  model: string;          // e.g. "tts-1", "kling-v3-standard", "suno-v4.5"
  description: string;    // human-readable, e.g. "sizzle-01-problem narration"
  costUsd: number;
  durationSec?: number;   // for video/music
  chars?: number;         // for TTS
  inputParams?: Record<string, unknown>; // generation params for reproducibility
}

// ---------------------------------------------------------------------------
// Budget Tracker
// ---------------------------------------------------------------------------

export class BudgetTracker {
  private sessionSpendUsd = 0;
  private sessionId: string;

  constructor() {
    this.sessionId = new Date().toISOString().replace(/[:.]/g, "-");
  }

  /** Read all ledger entries */
  readLedger(): SpendEntry[] {
    if (!fs.existsSync(LEDGER_PATH)) return [];
    return fs
      .readFileSync(LEDGER_PATH, "utf-8")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  }

  /** Get total spend for current calendar month */
  getMonthSpendUsd(): number {
    const entries = this.readLedger();
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return entries
      .filter((e) => e.timestamp.startsWith(monthPrefix))
      .reduce((sum, e) => sum + e.costUsd, 0);
  }

  /** Get total spend for current session */
  getSessionSpendUsd(): number {
    return this.sessionSpendUsd;
  }

  /** Get all-time total spend */
  getAllTimeSpendUsd(): number {
    return this.readLedger().reduce((sum, e) => sum + e.costUsd, 0);
  }

  /**
   * Check if a generation is within budget.
   * Throws if session cap exceeded. Warns if month cap exceeded.
   * Returns true if safe to proceed.
   */
  checkBudget(
    estimatedCostUsd: number,
    description: string,
    force = false
  ): boolean {
    const projectedSession = this.sessionSpendUsd + estimatedCostUsd;
    const projectedMonth = this.getMonthSpendUsd() + estimatedCostUsd;

    // Session hard cap
    if (projectedSession > SESSION_CAP_USD) {
      const msg = [
        `SESSION CAP EXCEEDED`,
        `  This generation: $${estimatedCostUsd.toFixed(4)}`,
        `  Session so far:  $${this.sessionSpendUsd.toFixed(4)}`,
        `  Projected:       $${projectedSession.toFixed(4)} > $${SESSION_CAP_USD} cap`,
        `  Description:     ${description}`,
        ``,
        `  Use --force to override session cap.`,
      ].join("\n");

      if (!force) {
        throw new Error(msg);
      }
      console.warn(`\n!!! ${msg}\n  --force set, proceeding anyway.\n`);
    }

    // Month soft cap
    if (projectedMonth > MONTH_CAP_USD) {
      console.warn(
        [
          ``,
          `!!! MONTH CAP WARNING`,
          `  Month spend so far: $${this.getMonthSpendUsd().toFixed(2)}`,
          `  This generation:    $${estimatedCostUsd.toFixed(4)}`,
          `  Projected month:    $${projectedMonth.toFixed(2)} > $${MONTH_CAP_USD} cap`,
          ``,
        ].join("\n")
      );
    }

    return true;
  }

  /** Record a completed generation to the ledger */
  recordSpend(entry: Omit<SpendEntry, "timestamp">): void {
    const fullEntry: SpendEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Append to JSONL ledger
    fs.appendFileSync(LEDGER_PATH, JSON.stringify(fullEntry) + "\n");

    // Track session total
    this.sessionSpendUsd += entry.costUsd;
  }

  /** Print a summary of spend */
  printSummary(): void {
    const entries = this.readLedger();
    const monthSpend = this.getMonthSpendUsd();

    // Group by category
    const byCategory: Record<string, number> = {};
    for (const e of entries) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.costUsd;
    }

    console.log("\n=== Budget Summary ===\n");
    console.log(`  Session:    $${this.sessionSpendUsd.toFixed(4)} / $${SESSION_CAP_USD}`);
    console.log(`  This month: $${monthSpend.toFixed(2)} / $${MONTH_CAP_USD}`);
    console.log(`  All-time:   $${this.getAllTimeSpendUsd().toFixed(2)}`);
    console.log();
    for (const [cat, total] of Object.entries(byCategory)) {
      console.log(`  ${cat}: $${total.toFixed(4)}`);
    }
    console.log();

    // Last 5 entries
    const recent = entries.slice(-5);
    if (recent.length > 0) {
      console.log("  Recent:");
      for (const e of recent) {
        const date = e.timestamp.slice(0, 10);
        console.log(`    ${date} ${e.category.padEnd(6)} $${e.costUsd.toFixed(4)} ${e.description.slice(0, 50)}`);
      }
      console.log();
    }
  }
}

// ---------------------------------------------------------------------------
// CLI: `npx tsx scripts/budget.ts` shows summary
// ---------------------------------------------------------------------------

if (require.main === module) {
  const budget = new BudgetTracker();
  budget.printSummary();
}
