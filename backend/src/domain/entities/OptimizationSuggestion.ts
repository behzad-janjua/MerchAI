export type OptimizationSuggestionInput = {
  productListingId: string;
  agentRunId: string;
  improvedTitle?: string | null;
  improvedDescription: string;
  tags: string[];
  positioningRecommendations?: string | null;
  seoNotes?: string | null;
  score?: number | null;
  rationale?: string | null;
};

export type OptimizationSuggestion = OptimizationSuggestionInput & {
  id: string;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
