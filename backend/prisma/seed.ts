import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.productListing.upsert({
    where: { shopifyProductId: "sample-shopify-product-1" },
    update: {},
    create: {
      shopifyProductId: "sample-shopify-product-1",
      title: "Minimal Tote",
      handle: "minimal-tote",
      vendor: "MerchAI Studio",
      productType: "Canvas Tote Bag",
      description: "A durable everyday tote for errands, work, and gifting.",
      tags: ["bag", "tote", "canvas"],
      price: "29.00",
      currency: "USD",
      inventoryQuantity: 42,
      rawData: {
        audience: "design-conscious shoppers who want practical everyday accessories"
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
