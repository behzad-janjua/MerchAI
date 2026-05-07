import { ProductListing, ProductListingWithSuggestion } from "../../../domain/entities/ProductListing.js";

export class ProductListingSerializer {
  serialize(listing: ProductListing | ProductListingWithSuggestion): Record<string, unknown> {
    return {
      id: listing.id,
      shopifyProductId: listing.shopifyProductId,
      title: listing.title,
      handle: listing.handle,
      vendor: listing.vendor,
      productType: listing.productType,
      description: listing.description,
      tags: listing.tags,
      price: listing.price,
      currency: listing.currency,
      inventoryQuantity: listing.inventoryQuantity,
      rawData: listing.rawData,
      latestSuggestion: "latestSuggestion" in listing ? listing.latestSuggestion : undefined,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    };
  }
}
