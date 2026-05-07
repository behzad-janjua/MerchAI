import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { OptimizationProvider } from "./OptimizationProvider.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export class OptimizationSuggestionGenerator {
  constructor(private readonly providers: OptimizationProvider[]) {}

  async generate(snapshot: ProductSnapshot, analysis: ListingAnalysis): Promise<OptimizationDraft> {
    for (const provider of this.providers) {
      const draft = await provider.generate(snapshot, analysis);

      if (draft) {
        return this.normalize(draft);
      }
    }

    throw new Error("No optimization provider produced a suggestion.");
  }

  private normalize(draft: OptimizationDraft): OptimizationDraft {
    return {
      improvedTitle: draft.improvedTitle?.trim() || null,
      improvedDescription: draft.improvedDescription.trim(),
      tags: [...new Set(draft.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 12),
      positioningRecommendations: draft.positioningRecommendations?.trim() || null,
      seoNotes: draft.seoNotes?.trim() || null,
      score: draft.score === null ? null : Math.max(0, Math.min(Number(draft.score), 100)),
      rationale: draft.rationale?.trim() || null
    };
  }
}
