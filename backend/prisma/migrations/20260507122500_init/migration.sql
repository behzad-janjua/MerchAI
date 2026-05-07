-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ProductListing" (
    "id" TEXT NOT NULL,
    "shopifyProductId" TEXT,
    "title" TEXT NOT NULL,
    "handle" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "inventoryQuantity" INTEGER,
    "rawData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "productListingId" TEXT NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "analysis" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationSuggestion" (
    "id" TEXT NOT NULL,
    "productListingId" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "improvedTitle" TEXT,
    "improvedDescription" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "positioningRecommendations" TEXT,
    "seoNotes" TEXT,
    "score" DECIMAL(5,2),
    "rationale" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductListing_shopifyProductId_key" ON "ProductListing"("shopifyProductId");

-- CreateIndex
CREATE INDEX "ProductListing_handle_idx" ON "ProductListing"("handle");

-- CreateIndex
CREATE INDEX "ProductListing_updatedAt_idx" ON "ProductListing"("updatedAt");

-- CreateIndex
CREATE INDEX "AgentRun_productListingId_createdAt_idx" ON "AgentRun"("productListingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OptimizationSuggestion_agentRunId_key" ON "OptimizationSuggestion"("agentRunId");

-- CreateIndex
CREATE INDEX "OptimizationSuggestion_productListingId_createdAt_idx" ON "OptimizationSuggestion"("productListingId", "createdAt");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_productListingId_fkey" FOREIGN KEY ("productListingId") REFERENCES "ProductListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSuggestion" ADD CONSTRAINT "OptimizationSuggestion_productListingId_fkey" FOREIGN KEY ("productListingId") REFERENCES "ProductListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationSuggestion" ADD CONSTRAINT "OptimizationSuggestion_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
