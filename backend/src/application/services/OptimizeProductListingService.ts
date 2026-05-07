import { AgentRun } from "../../domain/entities/AgentRun.js";
import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";
import { ProductOptimizationPipeline } from "../agent/ProductOptimizationPipeline.js";

export class OptimizeProductListingService {
  constructor(
    private readonly productListings: ProductListingRepository,
    private readonly pipeline: ProductOptimizationPipeline
  ) {}

  async execute(productListingId: string): Promise<AgentRun> {
    const listing = await this.productListings.findById(productListingId);

    if (!listing) {
      throw new NotFoundError("ProductListing", productListingId);
    }

    return this.pipeline.run(listing);
  }
}
