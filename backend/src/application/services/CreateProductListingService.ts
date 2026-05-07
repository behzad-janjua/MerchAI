import { ProductListing, ProductListingInput } from "../../domain/entities/ProductListing.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export class CreateProductListingService {
  constructor(private readonly productListings: ProductListingRepository) {}

  execute(input: ProductListingInput): Promise<ProductListing> {
    return this.productListings.create(input);
  }
}
