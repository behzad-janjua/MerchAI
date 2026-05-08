import { Environment } from "../../config/Environment.js";
import { LlmProviderConfigRepository } from "../../domain/repositories/LlmProviderConfigRepository.js";
import { FallbackOptimizationProvider } from "./FallbackOptimizationProvider.js";
import { LlmOptimizationProvider } from "./LlmOptimizationProvider.js";
import { OptimizationProvider } from "./OptimizationProvider.js";

export class OptimizationProviderRegistry {
  constructor(
    private readonly environment: Environment,
    private readonly providerConfigs: LlmProviderConfigRepository
  ) {}

  async providers(): Promise<OptimizationProvider[]> {
    const fallback = new FallbackOptimizationProvider();
    const config = await this.providerConfigs.findDefaultEnabled();

    if (config?.provider === "openai-compatible") {
      return [
        new LlmOptimizationProvider(this.environment, config),
        fallback
      ];
    }

    return [fallback];
  }
}
