import { LlmProviderConfig } from "../entities/LlmProviderConfig.js";

export interface LlmProviderConfigRepository {
  findDefaultEnabled(): Promise<LlmProviderConfig | null>;
}
