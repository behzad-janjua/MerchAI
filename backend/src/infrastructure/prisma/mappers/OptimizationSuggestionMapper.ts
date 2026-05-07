import { OptimizationSuggestion } from "../../../domain/entities/OptimizationSuggestion.js";

type DecimalLike = {
  toString(): string;
};

type PrismaOptimizationSuggestion = {
  id: string;
  productListingId: string;
  agentRunId: string;
  improvedTitle: string | null;
  improvedDescription: string;
  tags: string[];
  positioningRecommendations: string | null;
  seoNotes: string | null;
  score: DecimalLike | null;
  rationale: string | null;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class OptimizationSuggestionMapper {
  toDomain(record: PrismaOptimizationSuggestion): OptimizationSuggestion {
    return {
      id: record.id,
      productListingId: record.productListingId,
      agentRunId: record.agentRunId,
      improvedTitle: record.improvedTitle,
      improvedDescription: record.improvedDescription,
      tags: record.tags,
      positioningRecommendations: record.positioningRecommendations,
      seoNotes: record.seoNotes,
      score: record.score ? Number(record.score) : null,
      rationale: record.rationale,
      accepted: record.accepted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
