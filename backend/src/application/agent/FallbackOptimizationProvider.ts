import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import {
  OptimizationProvider,
  OptimizationProviderRequest,
  OptimizationProviderResult
} from "./OptimizationProvider.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export class FallbackOptimizationProvider implements OptimizationProvider {
  readonly providerName = "fallback";
  private readonly model = "deterministic-merchandising-rules";

  async generate(request: OptimizationProviderRequest): Promise<OptimizationProviderResult> {
    const response =
      request.stepName === "final_synthesis"
        ? JSON.stringify(this.draft(request.snapshot, request.analysis), null, 2)
        : this.findings(request);
    const draft = request.stepName === "final_synthesis"
      ? this.draft(request.snapshot, request.analysis)
      : null;
    const inputTokens = this.estimateTokens(request.prompt);
    const outputTokens = this.estimateTokens(response);

    return {
      response,
      draft,
      provider: this.providerName,
      model: this.model,
      inputTokens,
      outputTokens,
      estimatedCost: 0
    };
  }

  private draft(snapshot: ProductSnapshot, analysis: ListingAnalysis): OptimizationDraft {
    const productType = snapshot.productType || "Shopify Product";
    const title = snapshot.title || productType;
    const tags = this.tags(snapshot, productType);
    const firstOpportunity = analysis.opportunities[0] || "Highlight the clearest buyer benefit and product details.";

    return {
      improvedTitle: title.toLowerCase().includes(productType.toLowerCase()) ? title : `${title} - ${productType}`,
      improvedDescription: [
        snapshot.description || `A thoughtfully designed ${productType}.`,
        "",
        `Why customers will love it: ${firstOpportunity}`,
        `Best for shoppers looking for ${productType} with clear value, practical details, and easy gifting potential.`
      ].join("\n"),
      tags,
      positioningRecommendations: `${title} should be positioned around the primary buyer benefit first, then supported with product details. ${firstOpportunity}`,
      seoNotes: "Lead with the product category, include use-case keywords naturally, and keep the title readable for shoppers.",
      score: Math.min(analysis.score + 12, 100),
      rationale: "Generated from structured listing gaps and merchandising rules because no external LLM response was available."
    };
  }

  private findings(request: OptimizationProviderRequest): string {
    const { snapshot, analysis, stepName } = request;
    const productType = snapshot.productType || "product category";
    const title = snapshot.title || "Untitled product";
    const firstOpportunity = analysis.opportunities[0] || "Clarify the clearest customer benefit.";

    const findings: Record<typeof stepName, string[]> = {
      listing_snapshot: [
        `${title} is listed as ${productType} with ${snapshot.tags.length} tags.`,
        snapshot.description
          ? `Description length is ${snapshot.description.length} characters.`
          : "Description is missing and should be expanded before merchandising.",
        `Primary opportunity: ${firstOpportunity}`
      ],
      seo_analysis: [
        `Lead the title with searchable product terms around ${productType}.`,
        "Keep keywords readable and avoid stuffing repeated phrases.",
        analysis.issues.find((issue) => issue.toLowerCase().includes("title")) ?? "Title has enough base context for search."
      ],
      copy_analysis: [
        snapshot.description
          ? "Description exists, but should connect product facts to buyer outcomes."
          : "Description is missing, so conversion copy is the largest gap.",
        "Add concrete details such as material, fit, use case, care, size, or giftability where applicable.",
        firstOpportunity
      ],
      tag_analysis: [
        `Keep existing strong tags: ${snapshot.tags.slice(0, 5).join(", ") || "none yet"}.`,
        `Add product-type and intent tags for ${productType}.`,
        "Include audience, occasion, style, and use-case tags."
      ],
      audience_positioning_analysis: [
        `Likely audience: shoppers comparing ${productType} options.`,
        "Position around the primary buyer benefit first, then support with product specifics.",
        "Use simple language that works in both search snippets and collection pages."
      ],
      final_synthesis: []
    };

    return findings[stepName].map((finding) => `- ${finding}`).join("\n");
  }

  private estimateTokens(value: string): number {
    return Math.max(1, Math.ceil(value.length / 4));
  }

  private tags(snapshot: ProductSnapshot, productType: string): string[] {
    const rawTags = [
      ...snapshot.tags,
      productType,
      snapshot.vendor,
      "gift",
      "everyday",
      "quality",
      "bestseller"
    ];

    return [...new Set(rawTags.filter(Boolean).map((tag) => this.slug(String(tag))))].slice(0, 12);
  }

  private slug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
