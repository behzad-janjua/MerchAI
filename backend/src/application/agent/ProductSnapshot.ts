import { ProductListing } from "../../domain/entities/ProductListing.js";

export type ProductSnapshot = {
  id: string;
  shopifyProductId: string | null | undefined;
  title: string;
  handle: string | null | undefined;
  vendor: string | null | undefined;
  productType: string | null | undefined;
  description: string;
  tags: string[];
  price: number | null | undefined;
  currency: string;
  inventoryQuantity: number | null | undefined;
  rawData: Record<string, unknown>;
};

export class ProductSnapshotTool {
  execute(product: ProductListing): ProductSnapshot {
    return {
      id: product.id,
      shopifyProductId: product.shopifyProductId,
      title: product.title.trim(),
      handle: product.handle,
      vendor: product.vendor,
      productType: product.productType,
      description: product.description?.trim() ?? "",
      tags: product.tags.map((tag) => tag.trim()).filter(Boolean),
      price: product.price,
      currency: product.currency,
      inventoryQuantity: product.inventoryQuantity,
      rawData: product.rawData
    };
  }
}
