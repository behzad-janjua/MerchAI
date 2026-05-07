import { z } from "zod";

export const ProductListingInputSchema = z.object({
  shopifyProductId: z.string().trim().min(1).nullable().optional(),
  title: z.string().trim().min(1),
  handle: z.string().trim().min(1).nullable().optional(),
  vendor: z.string().trim().min(1).nullable().optional(),
  productType: z.string().trim().min(1).nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().trim().length(3).default("USD"),
  inventoryQuantity: z.number().int().nullable().optional(),
  rawData: z.record(z.unknown()).default({})
});

export const ProductListingUpdateSchema = ProductListingInputSchema.partial().extend({
  title: z.string().trim().min(1).optional()
});

export type ProductListingInputDto = z.infer<typeof ProductListingInputSchema>;
export type ProductListingUpdateDto = z.infer<typeof ProductListingUpdateSchema>;
