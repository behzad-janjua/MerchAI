import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.llmProviderConfig.upsert({
    where: { key: "gemini-free-demo" },
    update: {
      enabled: true,
      isDefault: true
    },
    create: {
      key: "gemini-free-demo",
      provider: "openai-compatible",
      displayName: "Gemini Free Demo",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKeyEnvVar: "GEMINI_API_KEY",
      model: "gemini-2.5-flash",
      // Demo pricing only: Gemini may be free for this portfolio flow, but fake nonzero costs make dashboards useful.
      inputCostPer1K: "0.000020",
      outputCostPer1K: "0.000080",
      enabled: true,
      isDefault: true,
      notes: "OpenAI-compatible Gemini example with simulated portfolio-demo cost tracking."
    }
  });

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
