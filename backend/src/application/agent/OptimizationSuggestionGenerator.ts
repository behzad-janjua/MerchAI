import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import {
  AgentStepName,
  OptimizationProviderResult
} from "./OptimizationProvider.js";
import { OptimizationProviderRegistry } from "./OptimizationProviderRegistry.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export class OptimizationSuggestionGenerator {
  constructor(private readonly providerRegistry: OptimizationProviderRegistry) {}

  async generate(
    stepName: AgentStepName,
    prompt: string,
    snapshot: ProductSnapshot,
    analysis: ListingAnalysis,
    priorStepResponses: Record<string, string>
  ): Promise<OptimizationProviderResult> {
    for (const provider of await this.providerRegistry.providers()) {
      const result = await provider.generate({
        stepName,
        prompt,
        snapshot,
        analysis,
        priorStepResponses
      });

      if (result && (stepName !== "final_synthesis" || result.draft)) {
        return {
          ...result,
          draft: result.draft ? this.normalize(result.draft) : null
        };
      }
    }

    throw new Error(`No optimization provider produced a response for ${stepName}.`);
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
