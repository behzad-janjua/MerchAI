import { Prisma, PrismaClient } from "@prisma/client";
import { AgentRun } from "../../../domain/entities/AgentRun.js";
import {
  AgentRunCostSummary,
  AgentRunRepository
} from "../../../domain/repositories/AgentRunRepository.js";
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
      },
      include: this.includeSteps()
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
      },
      include: this.includeSteps()
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
      },
      include: this.includeSteps()
    });

    return this.mapper.toDomain(record);
  }

  async findById(id: string): Promise<AgentRun | null> {
    const record = await this.prisma.agentRun.findUnique({
      where: { id },
      include: this.includeSteps()
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async costSummary(): Promise<AgentRunCostSummary> {
    const runs = await this.prisma.agentRun.findMany({
      include: this.includeSteps(),
      orderBy: { createdAt: "desc" }
    });

    const providerModelMap = new Map<
      string,
      AgentRunCostSummary["byProviderModel"][number] & { runIds: Set<string> }
    >();

    let totalEstimatedCost = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalStepRuns = 0;

    for (const run of runs) {
      for (const step of run.steps) {
        totalStepRuns += 1;
        const provider = step.provider ?? "unknown";
        const model = step.model ?? "unknown";
        const inputTokens = step.inputTokens ?? 0;
        const outputTokens = step.outputTokens ?? 0;
        const estimatedCost = step.estimatedCost ? Number(step.estimatedCost) : 0;
        const key = `${provider}:${model}`;

        totalEstimatedCost += estimatedCost;
        totalInputTokens += inputTokens;
        totalOutputTokens += outputTokens;

        const group = providerModelMap.get(key) ?? {
          provider,
          model,
          runCount: 0,
          stepCount: 0,
          inputTokens: 0,
          outputTokens: 0,
          estimatedCost: 0,
          runIds: new Set<string>()
        };

        group.stepCount += 1;
        group.inputTokens += inputTokens;
        group.outputTokens += outputTokens;
        group.estimatedCost += estimatedCost;
        group.runIds.add(run.id);
        providerModelMap.set(key, group);
      }
    }

    return {
      totalRuns: runs.length,
      totalStepRuns,
      totalEstimatedCost: this.money(totalEstimatedCost),
      totalInputTokens,
      totalOutputTokens,
      byProviderModel: [...providerModelMap.values()].map(({ runIds, ...group }) => ({
        ...group,
        runCount: runIds.size,
        estimatedCost: this.money(group.estimatedCost)
      })),
      latestRuns: runs.slice(0, 10).map((run) => {
        const providerModels = [
          ...new Set(run.steps.map((step) => `${step.provider ?? "unknown"} / ${step.model ?? "unknown"}`))
        ];
        const estimatedCost = run.steps.reduce(
          (sum, step) => sum + (step.estimatedCost ? Number(step.estimatedCost) : 0),
          0
        );

        return {
          id: run.id,
          productListingId: run.productListingId,
          status: run.status,
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          estimatedCost: this.money(estimatedCost),
          providerModels
        };
      })
    };
  }

  private includeSteps() {
    return {
      steps: {
        orderBy: { stepOrder: "asc" as const }
      }
    };
  }

  private money(value: number): number {
    return Number(value.toFixed(6));
  }
}
