export const APP_NAME = "Gist Agent V1";

export const SETTING_KEYS = {
  GEMINI_API_KEY: "gemini_api_key",
  TAVILY_API_KEY: "tavily_api_key",
  KIE_AI_API_KEY: "kie_ai_api_key",
  NOTION_API_KEY: "notion_api_key",
  NOTION_DATABASE_ID: "notion_database_id",
  TELEGRAM_BOT_TOKEN: "telegram_bot_token",
} as const;

export const RUN_STATUSES = [
  "pending",
  "researching",
  "writing",
  "designing",
  "archiving",
  "completed",
  "failed",
] as const;

export const STEP_NAMES = [
  "research",
  "copywriting",
  "design",
  "notion_archive",
] as const;

export const STEP_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
] as const;

export const RUN_SOURCES = ["ui", "telegram"] as const;

export const KIE_AI_BASE_URL = "https://api.kie.ai";
export const KIE_AI_MODEL = "google/nano-banana";
export const KIE_AI_POLL_INTERVAL_MS = 10_000;
export const KIE_AI_MAX_POLL_DURATION_MS = 300_000;

export const TELEGRAM_API_BASE = "https://api.telegram.org";
