import type {
  RUN_SOURCES,
  RUN_STATUSES,
  STEP_NAMES,
  STEP_STATUSES,
} from "./constants";

export type RunStatus = (typeof RUN_STATUSES)[number];
export type StepName = (typeof STEP_NAMES)[number];
export type StepStatus = (typeof STEP_STATUSES)[number];
export type RunSource = (typeof RUN_SOURCES)[number];

export interface Run {
  id: string;
  keyword: string;
  source: RunSource;
  status: RunStatus;
  linkedinPost: string | null;
  infographicUrl: string | null;
  researchData: ResearchSummary | null;
  errorMessage: string | null;
  triggerRunId: string | null;
  telegramChatId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepLog {
  id: string;
  runId: string;
  stepName: StepName;
  status: StepStatus;
  inputPayload: Record<string, unknown> | null;
  outputPayload: Record<string, unknown> | null;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface RunWithSteps extends Run {
  steps: StepLog[];
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface ResearchSummary {
  keyword: string;
  summary: string;
  keyTrends: string[];
  statistics: string[];
  notableCompanies: string[];
  recentNews: { title: string; url: string; snippet: string }[];
  searchAnswer: string;
}

export interface OrchestratorPayload {
  keyword: string;
  runId: string;
  source: RunSource;
  telegramChatId?: string;
}

export interface ResearcherPayload {
  keyword: string;
  runId: string;
}

export interface WriterPayload {
  keyword: string;
  runId: string;
  researchData: ResearchSummary;
}

export interface DesignerPayload {
  keyword: string;
  runId: string;
  researchData: ResearchSummary;
  linkedinPost: string;
}

export interface KieAiSubmitResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
  };
}

export interface KieAiPollResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
    state: string;
    image_url?: string;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}
