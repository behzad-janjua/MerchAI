import { AgentStepRun } from "../../../domain/entities/AgentStepRun.js";

type DecimalLike = {
  toString(): string;
};

export type PrismaAgentStepRun = {
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
  estimatedCost: DecimalLike | null;
  status: AgentStepRun["status"];
  errorMessage: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export class AgentStepRunMapper {
  toDomain(record: PrismaAgentStepRun): AgentStepRun {
    return {
      id: record.id,
      agentRunId: record.agentRunId,
      stepName: record.stepName,
      stepOrder: record.stepOrder,
      prompt: record.prompt,
      response: record.response,
      provider: record.provider,
      model: record.model,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      estimatedCost: record.estimatedCost ? Number(record.estimatedCost) : null,
      status: record.status,
      errorMessage: record.errorMessage,
      metadata: this.toObject(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  private toObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
