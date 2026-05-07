import { ListingAnalysis } from "./ListingAnalysis.js";
import { ProductSnapshot } from "./ProductSnapshot.js";

export interface ListingAnalyzer {
  analyze(snapshot: ProductSnapshot): ListingAnalysis;
}

export class StructuredListingAnalyzer implements ListingAnalyzer {
  private readonly minimumDescriptionLength = 240;
  private readonly idealTagCount = 8;

  analyze(snapshot: ProductSnapshot): ListingAnalysis {
    const issues: string[] = [];
    const opportunities: string[] = [];

    if (snapshot.description.length < this.minimumDescriptionLength) {
      issues.push("Description is short and may not communicate benefits, materials, or use cases.");
      opportunities.push("Expand the description with buyer outcomes, concrete product details, and care or fit notes.");
    }

    if (snapshot.tags.length < this.idealTagCount) {
      issues.push("Listing has fewer tags than recommended for merchandising and search discovery.");
      opportunities.push("Add intent, occasion, audience, and product-type tags.");
    }

    if (snapshot.title.split(/\s+/).filter(Boolean).length < 4) {
      issues.push("Title may be too generic for search and browsing contexts.");
      opportunities.push("Clarify the product category and a primary differentiator in the title.");
    }

    return {
      score: this.score(snapshot),
      issues,
      opportunities,
      attributesDetected: {
        hasVendor: Boolean(snapshot.vendor),
        hasProductType: Boolean(snapshot.productType),
        hasInventory: snapshot.inventoryQuantity !== null && snapshot.inventoryQuantity !== undefined,
        tagCount: snapshot.tags.length,
        descriptionLength: snapshot.description.length
      }
    };
  }

  private score(snapshot: ProductSnapshot): number {
    let score = 100;
    score -= snapshot.description.length < this.minimumDescriptionLength ? 25 : 0;
    score -= snapshot.tags.length < this.idealTagCount ? 15 : 0;
    score -= snapshot.title.split(/\s+/).filter(Boolean).length < 4 ? 10 : 0;
    score -= snapshot.productType ? 0 : 5;
    return Math.max(score, 0);
  }
}
