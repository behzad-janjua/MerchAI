import { PrismaClient } from "@prisma/client";
import {
  OptimizationSuggestion,
  OptimizationSuggestionInput
} from "../../../domain/entities/OptimizationSuggestion.js";
import { OptimizationSuggestionRepository } from "../../../domain/repositories/OptimizationSuggestionRepository.js";
import { OptimizationSuggestionMapper } from "../mappers/OptimizationSuggestionMapper.js";

export class PrismaOptimizationSuggestionRepository implements OptimizationSuggestionRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: OptimizationSuggestionMapper
  ) {}

  async create(input: OptimizationSuggestionInput): Promise<OptimizationSuggestion> {
    const record = await this.prisma.optimizationSuggestion.create({
      data: {
        productListingId: input.productListingId,
        agentRunId: input.agentRunId,
        improvedTitle: input.improvedTitle,
        improvedDescription: input.improvedDescription,
        tags: input.tags,
        positioningRecommendations: input.positioningRecommendations,
        seoNotes: input.seoNotes,
        score: input.score,
        rationale: input.rationale
      }
    });

    return this.mapper.toDomain(record);
  }

  async findLatestForProduct(productListingId: string): Promise<OptimizationSuggestion | null> {
    const record = await this.prisma.optimizationSuggestion.findFirst({
      where: { productListingId },
      orderBy: { createdAt: "desc" }
    });

    return record ? this.mapper.toDomain(record) : null;
  }
}
