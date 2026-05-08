import { ListingAnalysis } from "./ListingAnalysis.js";
import { AgentStepName } from "./OptimizationProvider.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export interface PromptBuilder {
  buildStep(
    stepName: AgentStepName,
    snapshot: ProductSnapshot,
    analysis: ListingAnalysis,
    priorStepResponses: Record<string, string>
  ): string;
}

export class OptimizationPromptBuilder implements PromptBuilder {
  buildStep(
    stepName: AgentStepName,
    snapshot: ProductSnapshot,
    analysis: ListingAnalysis,
    priorStepResponses: Record<string, string>
  ): string {
    const sharedContext = [
      "You are a Shopify product listing optimization agent.",
      "Be specific, practical, and concise. Use the provided product data only.",
      "",
      `Product snapshot: ${JSON.stringify(snapshot, null, 2)}`,
      "",
      `Structured rules analysis: ${JSON.stringify(analysis, null, 2)}`
    ];

    if (Object.keys(priorStepResponses).length > 0) {
      sharedContext.push("", `Previous step findings: ${JSON.stringify(priorStepResponses, null, 2)}`);
    }

    return [...sharedContext, "", this.stepInstruction(stepName)].join("\n");
  }

  private stepInstruction(stepName: AgentStepName): string {
    const instructions: Record<AgentStepName, string> = {
      listing_snapshot:
        "Step: listing snapshot. Summarize the listing's current merchandisable facts, gaps, and likely buyer intent in 4-6 bullets.",
      seo_analysis:
        "Step: SEO analysis. Identify search intent, title keyword opportunities, missing product/category terms, and SEO risks in 4-6 bullets.",
      copy_analysis:
        "Step: copy analysis. Review the title and description for clarity, benefit language, specificity, trust signals, and conversion gaps in 4-6 bullets.",
      tag_analysis:
        "Step: tag analysis. Recommend tag themes for product type, occasion, buyer, style, and use case. Keep findings actionable.",
      audience_positioning_analysis:
        "Step: audience and positioning analysis. Name the likely audience, primary value proposition, and best positioning angle in 4-6 bullets.",
      final_synthesis:
        "Step: final synthesis. Return only valid JSON with keys improvedTitle, improvedDescription, tags, positioningRecommendations, seoNotes, score, rationale. Use the previous findings to create a ready-to-review Shopify recommendation."
    };

    return instructions[stepName];
  }
}
