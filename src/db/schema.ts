import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const runStatusEnum = pgEnum("run_status", [
  "pending",
  "researching",
  "writing",
  "designing",
  "archiving",
  "completed",
  "failed",
]);

export const stepStatusEnum = pgEnum("step_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const runSourceEnum = pgEnum("run_source", ["ui", "telegram"]);

export const runs = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyword: text("keyword").notNull(),
  source: runSourceEnum("source").notNull(),
  status: runStatusEnum("status").notNull().default("pending"),
  linkedinPost: text("linkedin_post"),
  infographicUrl: text("infographic_url"),
  researchData: jsonb("research_data"),
  errorMessage: text("error_message"),
  triggerRunId: text("trigger_run_id"),
  telegramChatId: text("telegram_chat_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stepLogs = pgTable("step_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  stepName: text("step_name").notNull(),
  status: stepStatusEnum("status").notNull().default("pending"),
  inputPayload: jsonb("input_payload"),
  outputPayload: jsonb("output_payload"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
