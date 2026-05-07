import { Prisma, PrismaClient } from "@prisma/client";
import { AgentStepRun } from "../../../domain/entities/AgentStepRun.js";
import {
  AgentStepRunCompletion,
  AgentStepRunInput,
  AgentStepRunRepository
} from "../../../domain/repositories/AgentStepRunRepository.js";
import { AgentStepRunMapper } from "../mappers/AgentStepRunMapper.js";

export class PrismaAgentStepRunRepository implements AgentStepRunRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: AgentStepRunMapper
  ) {}

  async createRunning(input: AgentStepRunInput): Promise<AgentStepRun> {
    const record = await this.prisma.agentStepRun.create({
      data: {
        agentRunId: input.agentRunId,
        stepName: input.stepName,
        stepOrder: input.stepOrder,
        prompt: input.prompt,
        status: "RUNNING",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
      }
    });

    return this.mapper.toDomain(record);
  }

  async markCompleted(id: string, completion: AgentStepRunCompletion): Promise<AgentStepRun> {
    const record = await this.prisma.agentStepRun.update({
      where: { id },
      data: {
        response: completion.response,
        provider: completion.provider,
        model: completion.model,
        inputTokens: completion.inputTokens,
        outputTokens: completion.outputTokens,
        estimatedCost: completion.estimatedCost,
        status: "COMPLETED",
        metadata: (completion.metadata ?? {}) as Prisma.InputJsonValue
      }
    });

    return this.mapper.toDomain(record);
  }

  async markFailed(id: string, message: string, metadata: Record<string, unknown> = {}): Promise<AgentStepRun> {
    const record = await this.prisma.agentStepRun.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage: message,
        metadata: metadata as Prisma.InputJsonValue
      }
    });

    return this.mapper.toDomain(record);
  }
}
