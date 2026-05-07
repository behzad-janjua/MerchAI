import { OptimizationSuggestion, OptimizationSuggestionInput } from "../entities/OptimizationSuggestion.js";

export interface OptimizationSuggestionRepository {
  create(input: OptimizationSuggestionInput): Promise<OptimizationSuggestion>;
  findLatestForProduct(productListingId: string): Promise<OptimizationSuggestion | null>;
}
