export type OptimizationSuggestion = {
  id: string;
  improvedTitle: string | null;
  improvedDescription: string;
  tags: string[];
  positioningRecommendations: string | null;
  seoNotes: string | null;
  score: number | null;
  rationale: string | null;
  accepted: boolean;
  createdAt: string;
};

export type ProductListing = {
  id: string;
  shopifyProductId?: string | null;
  title: string;
  handle?: string | null;
  vendor?: string | null;
  productType?: string | null;
  description?: string | null;
  tags: string[];
  price?: number | null;
  currency: string;
  inventoryQuantity?: number | null;
  rawData: Record<string, unknown>;
  latestSuggestion?: OptimizationSuggestion | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductListingInput = {
  shopifyProductId?: string | null;
  title: string;
  handle?: string | null;
  vendor?: string | null;
  productType?: string | null;
  description?: string | null;
  tags: string[];
  price?: number | null;
  currency: string;
  inventoryQuantity?: number | null;
  rawData: Record<string, unknown>;
};

export type AgentRun = {
  id: string;
  productListingId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  analysis: {
    score?: number;
    issues?: string[];
    opportunities?: string[];
  };
};
