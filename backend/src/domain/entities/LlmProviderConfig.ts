export type LlmProviderConfig = {
  id: string;
  key: string;
  provider: string;
  displayName: string;
  baseUrl: string | null;
  apiKeyEnvVar: string | null;
  model: string;
  inputCostPer1K: number;
  outputCostPer1K: number;
  enabled: boolean;
  isDefault: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
