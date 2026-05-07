import { AgentRun } from "../../../domain/entities/AgentRun.js";

export class AgentRunSerializer {
  serialize(run: AgentRun): Record<string, unknown> {
    return {
      id: run.id,
      productListingId: run.productListingId,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      errorMessage: run.errorMessage,
      analysis: run.analysis,
      metadata: run.metadata,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    };
  }
}
