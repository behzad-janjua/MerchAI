import { LlmProviderConfig } from "../../../domain/entities/LlmProviderConfig.js";

type DecimalLike = {
  toString(): string;
};

type PrismaLlmProviderConfig = {
  id: string;
  key: string;
  provider: string;
  displayName: string;
  baseUrl: string | null;
  apiKeyEnvVar: string | null;
  model: string;
  inputCostPer1K: DecimalLike;
  outputCostPer1K: DecimalLike;
  enabled: boolean;
  isDefault: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class LlmProviderConfigMapper {
  toDomain(record: PrismaLlmProviderConfig): LlmProviderConfig {
    return {
      id: record.id,
      key: record.key,
      provider: record.provider,
      displayName: record.displayName,
      baseUrl: record.baseUrl,
      apiKeyEnvVar: record.apiKeyEnvVar,
      model: record.model,
      inputCostPer1K: Number(record.inputCostPer1K),
      outputCostPer1K: Number(record.outputCostPer1K),
      enabled: record.enabled,
      isDefault: record.isDefault,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
