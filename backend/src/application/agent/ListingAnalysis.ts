export type ListingAnalysis = {
  score: number;
  issues: string[];
  opportunities: string[];
  attributesDetected: {
    hasVendor: boolean;
    hasProductType: boolean;
    hasInventory: boolean;
    tagCount: number;
    descriptionLength: number;
  };
};
