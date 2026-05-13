module Agent
  class OptimizationProviderRegistry
    def providers
      config = LlmProviderConfig.default_enabled
      fallback = FallbackOptimizationProvider.new

      if config&.provider == "openai-compatible"
        [LlmOptimizationProvider.new(config), fallback]
      else
        [fallback]
      end
    end
  end
end
