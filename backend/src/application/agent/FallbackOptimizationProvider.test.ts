import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FallbackOptimizationProvider } from "./FallbackOptimizationProvider.js";
import { ListingAnalysis } from "./ListingAnalysis.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

describe("FallbackOptimizationProvider", () => {
  const snapshot: ProductSnapshot = {
    id: "listing-1",
    shopifyProductId: null,
    title: "Camp Mug",
    handle: "camp-mug",
    vendor: "Merch Co",
    productType: "Drinkware",
    description: "A sturdy mug.",
    tags: ["mug"],
    price: 18,
    currency: "USD",
    inventoryQuantity: 12,
    rawData: {}
  };
  const analysis: ListingAnalysis = {
    score: 65,
    issues: ["Description is short."],
    opportunities: ["Expand the description with buyer outcomes."],
    attributesDetected: {
      hasVendor: true,
      hasProductType: true,
      hasInventory: true,
      tagCount: 1,
      descriptionLength: 13
    }
  };

  it("produces deterministic findings with zero cost metadata", async () => {
    const result = await new FallbackOptimizationProvider().generate({
      stepName: "seo_analysis",
      prompt: "Analyze SEO",
      snapshot,
      analysis,
      priorStepResponses: {}
    });

    assert.equal(result.provider, "fallback");
    assert.equal(result.estimatedCost, 0);
    assert.ok(result.inputTokens > 0);
    assert.ok(result.outputTokens > 0);
    assert.match(result.response, /searchable product terms/i);
  });

  it("produces a final suggestion without external API keys", async () => {
    const result = await new FallbackOptimizationProvider().generate({
      stepName: "final_synthesis",
      prompt: "Return JSON",
      snapshot,
      analysis,
      priorStepResponses: {
        seo_analysis: "- Add product category terms"
      }
    });

    assert.equal(result.provider, "fallback");
    assert.ok(result.draft);
    assert.match(result.draft?.improvedDescription ?? "", /Why customers will love it/);
    assert.equal(result.draft?.score, 77);
  });
});
