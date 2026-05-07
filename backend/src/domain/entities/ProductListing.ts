export type ProductListingId = string;

export type ProductListingInput = {
  shopifyProductId?: string | null;
  title: string;
  handle?: string | null;
  vendor?: string | null;
  productType?: string | null;
  description?: string | null;
  tags?: string[];
  price?: number | null;
  currency?: string;
  inventoryQuantity?: number | null;
  rawData?: Record<string, unknown>;
};

export type ProductListing = ProductListingInput & {
  id: ProductListingId;
  tags: string[];
  currency: string;
  rawData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductListingWithSuggestion = ProductListing & {
  latestSuggestion: OptimizationSuggestionSummary | null;
};

export type OptimizationSuggestionSummary = {
  id: string;
  agentRunId: string;
  improvedTitle: string | null;
  improvedDescription: string;
  tags: string[];
  positioningRecommendations: string | null;
  seoNotes: string | null;
  score: number | null;
  rationale: string | null;
  accepted: boolean;
  createdAt: Date;
};
