import {
  OptimizationSuggestionSummary,
  ProductListing,
  ProductListingWithSuggestion
} from "../../../domain/entities/ProductListing.js";

type DecimalLike = {
  toString(): string;
};

type PrismaProductListing = {
  id: string;
  shopifyProductId: string | null;
  title: string;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  description: string | null;
  tags: string[];
  price: DecimalLike | null;
  currency: string;
  inventoryQuantity: number | null;
  rawData: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaSuggestion = {
  id: string;
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
};

export class ProductListingMapper {
  toDomain(record: PrismaProductListing): ProductListing {
    return {
      id: record.id,
      shopifyProductId: record.shopifyProductId,
      title: record.title,
      handle: record.handle,
      vendor: record.vendor,
      productType: record.productType,
      description: record.description,
      tags: record.tags,
      price: record.price ? Number(record.price) : null,
      currency: record.currency,
      inventoryQuantity: record.inventoryQuantity,
      rawData: this.toObject(record.rawData),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  toDomainWithSuggestion(record: PrismaProductListing & { suggestions: PrismaSuggestion[] }): ProductListingWithSuggestion {
    return {
      ...this.toDomain(record),
      latestSuggestion: record.suggestions[0] ? this.toSuggestionSummary(record.suggestions[0]) : null
    };
  }

  private toSuggestionSummary(record: PrismaSuggestion): OptimizationSuggestionSummary {
    return {
      id: record.id,
      agentRunId: record.agentRunId,
      improvedTitle: record.improvedTitle,
      improvedDescription: record.improvedDescription,
      tags: record.tags,
      positioningRecommendations: record.positioningRecommendations,
      seoNotes: record.seoNotes,
      score: record.score ? Number(record.score) : null,
      rationale: record.rationale,
      accepted: record.accepted,
      createdAt: record.createdAt
    };
  }

  private toObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
