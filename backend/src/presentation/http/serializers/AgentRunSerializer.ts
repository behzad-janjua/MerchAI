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
      steps: run.steps.map((step) => ({
        id: step.id,
        agentRunId: step.agentRunId,
        stepName: step.stepName,
        stepOrder: step.stepOrder,
        prompt: step.prompt,
        response: step.response,
        provider: step.provider,
        model: step.model,
        inputTokens: step.inputTokens,
        outputTokens: step.outputTokens,
        estimatedCost: step.estimatedCost,
        status: step.status,
        errorMessage: step.errorMessage,
        metadata: step.metadata,
        createdAt: step.createdAt,
        updatedAt: step.updatedAt
      })),
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    };
  }
}
