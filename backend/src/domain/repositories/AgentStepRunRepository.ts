import { AgentStepRun } from "../entities/AgentStepRun.js";

export type AgentStepRunInput = {
  agentRunId: string;
  stepName: string;
  stepOrder: number;
  prompt: string;
  metadata?: Record<string, unknown>;
};

export type AgentStepRunCompletion = {
  response: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  metadata?: Record<string, unknown>;
};

export interface AgentStepRunRepository {
  createRunning(input: AgentStepRunInput): Promise<AgentStepRun>;
  markCompleted(id: string, completion: AgentStepRunCompletion): Promise<AgentStepRun>;
  markFailed(id: string, message: string, metadata?: Record<string, unknown>): Promise<AgentStepRun>;
}
