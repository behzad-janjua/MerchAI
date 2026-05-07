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

export type AgentStepRun = {
  id: string;
  agentRunId: string;
  stepName: string;
  stepOrder: number;
  prompt: string;
  response: string | null;
  provider: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
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
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  analysis: {
    score?: number;
    issues?: string[];
    opportunities?: string[];
    stepFindings?: Record<string, string>;
  };
  metadata: Record<string, unknown>;
  steps: AgentStepRun[];
  createdAt: string;
  updatedAt: string;
};

export type CsvImportResult = {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  format: "shopify" | "simple";
  errors: Array<{
    row: number;
    errors: string[];
  }>;
};

export type AgentRunCostSummary = {
  totalRuns: number;
  totalStepRuns: number;
  totalEstimatedCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byProviderModel: Array<{
    provider: string;
    model: string;
    runCount: number;
    stepCount: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }>;
  latestRuns: Array<{
    id: string;
    productListingId: string;
    status: AgentRun["status"];
    startedAt: string | null;
    completedAt: string | null;
    estimatedCost: number;
    providerModels: string[];
  }>;
};
