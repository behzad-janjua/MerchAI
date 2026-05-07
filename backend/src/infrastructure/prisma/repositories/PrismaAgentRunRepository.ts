import { Prisma, PrismaClient } from "@prisma/client";
import { AgentRun } from "../../../domain/entities/AgentRun.js";
import { AgentRunRepository } from "../../../domain/repositories/AgentRunRepository.js";
import { AgentRunMapper } from "../mappers/AgentRunMapper.js";

export class PrismaAgentRunRepository implements AgentRunRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: AgentRunMapper
  ) {}

  async createRunning(productListingId: string, metadata: Record<string, unknown> = {}): Promise<AgentRun> {
    const record = await this.prisma.agentRun.create({
      data: {
        productListingId,
        status: "RUNNING",
        startedAt: new Date(),
        metadata: metadata as Prisma.InputJsonValue
      }
    });

    return this.mapper.toDomain(record);
  }

  async markCompleted(id: string, analysis: Record<string, unknown>): Promise<AgentRun> {
    const record = await this.prisma.agentRun.update({
      where: { id },
      data: {
        status: "COMPLETED",
        analysis: analysis as Prisma.InputJsonValue,
        completedAt: new Date()
      }
    });

    return this.mapper.toDomain(record);
  }

  async markFailed(id: string, message: string): Promise<AgentRun> {
    const record = await this.prisma.agentRun.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage: message,
        completedAt: new Date()
      }
    });

    return this.mapper.toDomain(record);
  }

  async findById(id: string): Promise<AgentRun | null> {
    const record = await this.prisma.agentRun.findUnique({ where: { id } });
    return record ? this.mapper.toDomain(record) : null;
  }
}
