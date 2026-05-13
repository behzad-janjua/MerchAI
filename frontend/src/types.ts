export type OptimizationSuggestion = {
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
  createdAt: string;
};

export type ProductListing = {
  id: string;
  shopifyProductId: string | null;
  title: string;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  description: string | null;
  tags: string[];
  price: number | null;
  currency: string;
  inventoryQuantity: number | null;
  rawData: Record<string, unknown>;
  latestSuggestion: OptimizationSuggestion | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentStepRun = {
  id: string;
  stepName: string;
  stepOrder: number;
  prompt: string;
  response: string | null;
  provider: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  status: string;
  errorMessage: string | null;
};

export type AgentRun = {
  id: string;
  productListingId: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  steps: AgentStepRun[];
};

export type CostSummaryRow = {
  provider: string;
  model: string;
  estimatedCost: number;
  inputTokens: number;
  outputTokens: number;
  stepRunCount: number;
};

export type CostSummary = {
  totalEstimatedCost: number;
  totalStepRuns: number;
  byProviderModel: CostSummaryRow[];
};

export type ListingFormData = {
  title: string;
  shopifyProductId: string;
  handle: string;
  vendor: string;
  productType: string;
  currency: string;
  price: string;
  inventoryQuantity: string;
  tags: string;
  audience: string;
  description: string;
};
