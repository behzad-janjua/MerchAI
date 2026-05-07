import { ProductListingWithSuggestion } from "../../domain/entities/ProductListing.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export class ListProductListingsService {
  constructor(private readonly productListings: ProductListingRepository) {}

  execute(): Promise<ProductListingWithSuggestion[]> {
    return this.productListings.findAll();
  }
}
