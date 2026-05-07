-- CreateTable
CREATE TABLE "AgentStepRun" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCost" DECIMAL(10,6),
    "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentStepRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentStepRun_agentRunId_stepOrder_idx" ON "AgentStepRun"("agentRunId", "stepOrder");

-- CreateIndex
CREATE INDEX "AgentStepRun_provider_model_idx" ON "AgentStepRun"("provider", "model");

-- AddForeignKey
ALTER TABLE "AgentStepRun" ADD CONSTRAINT "AgentStepRun_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
