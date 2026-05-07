import { AgentRun } from "../entities/AgentRun.js";

export type AgentRunCostSummary = {
  totalRuns: number;
  totalStepRuns: number;
  totalEstimatedCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byProviderModel: Array<{
    provider: string;
    model: string;
    runCount: number;
    stepCount: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }>;
  latestRuns: Array<{
    id: string;
    productListingId: string;
    status: AgentRun["status"];
    startedAt: Date | null;
    completedAt: Date | null;
    estimatedCost: number;
    providerModels: string[];
  }>;
};

export interface AgentRunRepository {
  createRunning(productListingId: string, metadata?: Record<string, unknown>): Promise<AgentRun>;
  markCompleted(id: string, analysis: Record<string, unknown>): Promise<AgentRun>;
  markFailed(id: string, message: string): Promise<AgentRun>;
  findById(id: string): Promise<AgentRun | null>;
  costSummary(): Promise<AgentRunCostSummary>;
}
