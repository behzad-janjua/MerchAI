import { AgentRun } from "../../../domain/entities/AgentRun.js";
import { AgentStepRunMapper, PrismaAgentStepRun } from "./AgentStepRunMapper.js";

type PrismaAgentRun = {
  id: string;
  productListingId: string;
  status: AgentRun["status"];
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  analysis: unknown;
  metadata: unknown;
  steps?: PrismaAgentStepRun[];
  createdAt: Date;
  updatedAt: Date;
};

export class AgentRunMapper {
  private readonly stepMapper = new AgentStepRunMapper();

  toDomain(record: PrismaAgentRun): AgentRun {
    return {
      id: record.id,
      productListingId: record.productListingId,
      status: record.status,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      errorMessage: record.errorMessage,
      analysis: this.toObject(record.analysis),
      metadata: this.toObject(record.metadata),
      steps: record.steps?.map((step) => this.stepMapper.toDomain(step)) ?? [],
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
