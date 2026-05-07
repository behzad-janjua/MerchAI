import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export class DeleteProductListingService {
  constructor(private readonly productListings: ProductListingRepository) {}

  async execute(id: string): Promise<void> {
    const listing = await this.productListings.findById(id);

    if (!listing) {
      throw new NotFoundError("ProductListing", id);
    }

    await this.productListings.delete(id);
  }
}
