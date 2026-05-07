import { Environment } from "../../config/Environment.js";
import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { OptimizationProvider } from "./OptimizationProvider.js";
import { PromptBuilder } from "./OptimizationPromptBuilder.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export class LlmOptimizationProvider implements OptimizationProvider {
  constructor(
    private readonly environment: Environment,
    private readonly promptBuilder: PromptBuilder
  ) {}

  async generate(snapshot: ProductSnapshot, analysis: ListingAnalysis): Promise<OptimizationDraft | null> {
    if (!this.environment.llmApiUrl) {
      return null;
    }

    const response = await fetch(this.environment.llmApiUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: this.environment.llmModel,
        prompt: this.promptBuilder.build(snapshot, analysis),
        responseFormat: "json"
      })
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as unknown;
    return this.toDraft(body);
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (this.environment.llmApiKey) {
      headers.Authorization = `Bearer ${this.environment.llmApiKey}`;
    }

    return headers;
  }

  private toDraft(body: unknown): OptimizationDraft | null {
    if (!body || typeof body !== "object") {
      return null;
    }

    const candidate = body as Record<string, unknown>;

    if (typeof candidate.improvedDescription !== "string") {
      return null;
    }

    return {
      improvedTitle: typeof candidate.improvedTitle === "string" ? candidate.improvedTitle : null,
      improvedDescription: candidate.improvedDescription,
      tags: Array.isArray(candidate.tags) ? candidate.tags.map(String) : [],
      positioningRecommendations:
        typeof candidate.positioningRecommendations === "string" ? candidate.positioningRecommendations : null,
      seoNotes: typeof candidate.seoNotes === "string" ? candidate.seoNotes : null,
      score: typeof candidate.score === "number" ? candidate.score : null,
      rationale: typeof candidate.rationale === "string" ? candidate.rationale : null
    };
  }
}
