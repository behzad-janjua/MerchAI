import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export interface OptimizationProvider {
  generate(snapshot: ProductSnapshot, analysis: ListingAnalysis): Promise<OptimizationDraft | null>;
}
