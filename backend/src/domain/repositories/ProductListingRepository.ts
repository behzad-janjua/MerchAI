import {
  ProductListing,
  ProductListingId,
  ProductListingInput,
  ProductListingWithSuggestion
} from "../entities/ProductListing.js";

export type ImportedProductListingResult = {
  listing: ProductListing;
  created: boolean;
};

export interface ProductListingRepository {
  findAll(): Promise<ProductListingWithSuggestion[]>;
  findById(id: ProductListingId): Promise<ProductListing | null>;
  create(input: ProductListingInput): Promise<ProductListing>;
  upsertImported(input: ProductListingInput): Promise<ImportedProductListingResult>;
  update(id: ProductListingId, input: Partial<ProductListingInput>): Promise<ProductListing>;
  delete(id: ProductListingId): Promise<void>;
}
