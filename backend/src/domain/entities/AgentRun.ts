export type AgentRunStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type AgentRun = {
  id: string;
  productListingId: string;
  status: AgentRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  analysis: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
