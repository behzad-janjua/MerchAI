import { ProductListing } from "../../domain/entities/ProductListing.js";
import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export class GetProductListingService {
  constructor(private readonly productListings: ProductListingRepository) {}

  async execute(id: string): Promise<ProductListing> {
    const listing = await this.productListings.findById(id);

    if (!listing) {
      throw new NotFoundError("ProductListing", id);
    }

    return listing;
  }
}
