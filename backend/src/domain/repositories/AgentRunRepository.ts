import { AgentRun } from "../entities/AgentRun.js";

export interface AgentRunRepository {
  createRunning(productListingId: string, metadata?: Record<string, unknown>): Promise<AgentRun>;
  markCompleted(id: string, analysis: Record<string, unknown>): Promise<AgentRun>;
  markFailed(id: string, message: string): Promise<AgentRun>;
  findById(id: string): Promise<AgentRun | null>;
}
