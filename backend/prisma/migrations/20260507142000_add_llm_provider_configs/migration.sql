-- CreateTable
CREATE TABLE "LlmProviderConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "baseUrl" TEXT,
    "apiKeyEnvVar" TEXT,
    "model" TEXT NOT NULL,
    "inputCostPer1K" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "outputCostPer1K" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LlmProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LlmProviderConfig_key_key" ON "LlmProviderConfig"("key");

-- CreateIndex
CREATE INDEX "LlmProviderConfig_enabled_isDefault_idx" ON "LlmProviderConfig"("enabled", "isDefault");

-- CreateIndex
CREATE INDEX "LlmProviderConfig_provider_model_idx" ON "LlmProviderConfig"("provider", "model");
