import { ListingAnalysis } from "./ListingAnalysis.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export interface PromptBuilder {
  build(snapshot: ProductSnapshot, analysis: ListingAnalysis): string;
}

export class OptimizationPromptBuilder implements PromptBuilder {
  build(snapshot: ProductSnapshot, analysis: ListingAnalysis): string {
    return [
      "You are an ecommerce merchandising expert optimizing a Shopify product listing.",
      "",
      "Return JSON with these keys: improvedTitle, improvedDescription, tags, positioningRecommendations, seoNotes, score, rationale.",
      "",
      `Product: ${JSON.stringify(snapshot, null, 2)}`,
      "",
      `Structured analysis: ${JSON.stringify(analysis, null, 2)}`
    ].join("\n");
  }
}
