import { ProductListing, ProductListingInput } from "../types";

export type ProductListingFormState = {
  title: string;
  shopifyProductId: string;
  handle: string;
  vendor: string;
  productType: string;
  description: string;
  tags: string;
  price: string;
  currency: string;
  inventoryQuantity: string;
  audience: string;
};

export class ProductListingFormMapper {
  empty(): ProductListingFormState {
    return {
      title: "",
      shopifyProductId: "",
      handle: "",
      vendor: "",
      productType: "",
      description: "",
      tags: "",
      price: "",
      currency: "USD",
      inventoryQuantity: "",
      audience: ""
    };
  }

  fromListing(listing: ProductListing): ProductListingFormState {
    return {
      title: listing.title,
      shopifyProductId: listing.shopifyProductId ?? "",
      handle: listing.handle ?? "",
      vendor: listing.vendor ?? "",
      productType: listing.productType ?? "",
      description: listing.description ?? "",
      tags: listing.tags.join(", "),
      price: listing.price?.toString() ?? "",
      currency: listing.currency,
      inventoryQuantity: listing.inventoryQuantity?.toString() ?? "",
      audience: typeof listing.rawData.audience === "string" ? listing.rawData.audience : ""
    };
  }

  toInput(form: ProductListingFormState): ProductListingInput {
    return {
      title: form.title.trim(),
      shopifyProductId: this.optional(form.shopifyProductId),
      handle: this.optional(form.handle),
      vendor: this.optional(form.vendor),
      productType: this.optional(form.productType),
      description: this.optional(form.description),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      price: form.price ? Number(form.price) : null,
      currency: form.currency.trim().toUpperCase() || "USD",
      inventoryQuantity: form.inventoryQuantity ? Number(form.inventoryQuantity) : null,
      rawData: {
        audience: form.audience.trim()
      }
    };
  }

  private optional(value: string): string | null {
    return value.trim() || null;
  }
}
