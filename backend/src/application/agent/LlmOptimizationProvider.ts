import { Environment } from "../../config/Environment.js";
import { LlmProviderConfig } from "../../domain/entities/LlmProviderConfig.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import {
  OptimizationProvider,
  OptimizationProviderRequest,
  OptimizationProviderResult
} from "./OptimizationProvider.js";

export class LlmOptimizationProvider implements OptimizationProvider {
  readonly providerName: string;

  constructor(
    private readonly environment: Environment,
    private readonly config: LlmProviderConfig
  ) {
    this.providerName = config.key;
  }

  async generate(request: OptimizationProviderRequest): Promise<OptimizationProviderResult | null> {
    const apiUrl = this.config.baseUrl || this.environment.llmApiUrl;

    if (!apiUrl) {
      return null;
    }

    const prompt = request.prompt;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "You are a precise ecommerce merchandising assistant for Shopify product listings."
          },
          { role: "user", content: prompt }
        ],
        response_format: request.stepName === "final_synthesis" ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as unknown;
    const text = this.toText(body);

    if (!text) {
      return null;
    }

    const usage = this.toUsage(body, prompt, text);
    return {
      response: text,
      draft: request.stepName === "final_synthesis" ? this.toDraft(text) : null,
      provider: this.providerName,
      model: this.config.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      estimatedCost: this.estimateCost(usage.inputTokens, usage.outputTokens)
    };
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const configuredKey = this.config.apiKeyEnvVar ? this.environment.getOptional(this.config.apiKeyEnvVar) : "";
    const apiKey = configuredKey || this.environment.llmApiKey;

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    return headers;
  }

  private toText(body: unknown): string | null {
    if (!body || typeof body !== "object") {
      return null;
    }

    const payload = body as Record<string, unknown>;
    const choices = payload.choices;

    if (Array.isArray(choices)) {
      const first = choices[0] as Record<string, unknown> | undefined;
      const message = first?.message as Record<string, unknown> | undefined;
      const content = message?.content ?? first?.text;
      return typeof content === "string" ? content : null;
    }

    if (typeof payload.output_text === "string") {
      return payload.output_text;
    }

    if (typeof payload.content === "string") {
      return payload.content;
    }

    return null;
  }

  private toUsage(body: unknown, prompt: string, response: string): { inputTokens: number; outputTokens: number } {
    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const usage = payload.usage && typeof payload.usage === "object"
      ? (payload.usage as Record<string, unknown>)
      : {};

    return {
      inputTokens: this.numberFrom(usage.prompt_tokens ?? usage.input_tokens) ?? this.estimateTokens(prompt),
      outputTokens: this.numberFrom(usage.completion_tokens ?? usage.output_tokens) ?? this.estimateTokens(response)
    };
  }

  private toDraft(text: string): OptimizationDraft | null {
    const candidate = this.parseJsonObject(text);

    if (!candidate || typeof candidate.improvedDescription !== "string") {
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

  private parseJsonObject(text: string): Record<string, unknown> | null {
    const trimmed = text.trim();
    const json = trimmed.startsWith("{")
      ? trimmed
      : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);

    if (!json) {
      return null;
    }

    try {
      const parsed = JSON.parse(json) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  private estimateTokens(value: string): number {
    return Math.max(1, Math.ceil(value.length / 4));
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.config.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * this.config.outputCostPer1K;
    return Number((inputCost + outputCost).toFixed(6));
  }

  private numberFrom(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
}
