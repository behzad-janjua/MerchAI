import type { AgentRunStatus } from "./AgentRun.js";

export type AgentStepRun = {
  id: string;
  agentRunId: string;
  stepName: string;
  stepOrder: number;
  prompt: string;
  response: string | null;
  provider: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  status: AgentRunStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
