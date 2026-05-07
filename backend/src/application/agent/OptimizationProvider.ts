import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export type AgentStepName =
  | "listing_snapshot"
  | "seo_analysis"
  | "copy_analysis"
  | "tag_analysis"
  | "audience_positioning_analysis"
  | "final_synthesis";

export type OptimizationProviderRequest = {
  stepName: AgentStepName;
  prompt: string;
  snapshot: ProductSnapshot;
  analysis: ListingAnalysis;
  priorStepResponses: Record<string, string>;
};

export type OptimizationProviderMetadata = {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
};

export type OptimizationProviderResult = OptimizationProviderMetadata & {
  response: string;
  draft?: OptimizationDraft | null;
};

export interface OptimizationProvider {
  readonly providerName: string;
  generate(request: OptimizationProviderRequest): Promise<OptimizationProviderResult | null>;
}
