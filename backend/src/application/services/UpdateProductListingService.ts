import { ProductListing, ProductListingInput } from "../../domain/entities/ProductListing.js";
import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export class UpdateProductListingService {
  constructor(private readonly productListings: ProductListingRepository) {}

  async execute(id: string, input: Partial<ProductListingInput>): Promise<ProductListing> {
    const listing = await this.productListings.findById(id);

    if (!listing) {
      throw new NotFoundError("ProductListing", id);
    }

    return this.productListings.update(id, input);
  }
}
