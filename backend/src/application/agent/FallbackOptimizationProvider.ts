import { ListingAnalysis } from "./ListingAnalysis.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { OptimizationProvider } from "./OptimizationProvider.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export class FallbackOptimizationProvider implements OptimizationProvider {
  async generate(snapshot: ProductSnapshot, analysis: ListingAnalysis): Promise<OptimizationDraft> {
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
