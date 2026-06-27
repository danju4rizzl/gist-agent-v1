import { eq, desc } from "drizzle-orm";
import { db } from ".";
import { runs, stepLogs, settings } from "./schema";
import type {
  RunStatus,
  RunSource,
  StepName,
  StepStatus,
  ResearchSummary,
} from "@/lib/types";

// ── Settings ──────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return result[0]?.value ?? null;
}

export async function upsertSetting(
  key: string,
  value: string
): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function getAllSettings() {
  return db.select().from(settings);
}

// ── Runs ──────────────────────────────────────────────────────────────

export async function createRun(
  keyword: string,
  source: RunSource,
  telegramChatId?: string
) {
  const result = await db
    .insert(runs)
    .values({ keyword, source, telegramChatId })
    .returning();
  return result[0];
}

export async function updateRunStatus(
  runId: string,
  status: RunStatus,
  data?: {
    linkedinPost?: string;
    infographicUrl?: string;
    researchData?: ResearchSummary;
    errorMessage?: string;
    triggerRunId?: string;
  }
) {
  await db
    .update(runs)
    .set({ status, ...data, updatedAt: new Date() })
    .where(eq(runs.id, runId));
}

export async function getRunById(runId: string) {
  const result = await db
    .select()
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);
  return result[0] ?? null;
}

export async function getRunWithSteps(runId: string) {
  const run = await getRunById(runId);
  if (!run) return null;

  const steps = await db
    .select()
    .from(stepLogs)
    .where(eq(stepLogs.runId, runId))
    .orderBy(stepLogs.startedAt);

  return { ...run, steps };
}

export async function listRuns(limit = 20, offset = 0) {
  return db
    .select()
    .from(runs)
    .orderBy(desc(runs.createdAt))
    .limit(limit)
    .offset(offset);
}

// ── Step Logs ─────────────────────────────────────────────────────────

export async function createStepLog(runId: string, stepName: StepName) {
  const result = await db
    .insert(stepLogs)
    .values({ runId, stepName, status: "running" as StepStatus })
    .returning();
  return result[0];
}

export async function completeStepLog(
  logId: string,
  outputPayload: Record<string, unknown>
) {
  await db
    .update(stepLogs)
    .set({
      status: "completed" as StepStatus,
      outputPayload,
      completedAt: new Date(),
    })
    .where(eq(stepLogs.id, logId));
}

export async function failStepLog(logId: string, errorMessage: string) {
  await db
    .update(stepLogs)
    .set({
      status: "failed" as StepStatus,
      errorMessage,
      completedAt: new Date(),
    })
    .where(eq(stepLogs.id, logId));
}
