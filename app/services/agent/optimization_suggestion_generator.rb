module Agent
  class OptimizationSuggestionGenerator
    def initialize(registry = OptimizationProviderRegistry.new)
      @registry = registry
    end

    def generate(step_name:, prompt:, snapshot:, analysis:, prior_responses: {})
      @registry.providers.each do |provider|
        result = provider.generate(
          step_name: step_name,
          prompt: prompt,
          snapshot: snapshot,
          analysis: analysis,
          prior_responses: prior_responses
        )

        next unless result

        if step_name == "final_synthesis"
          next unless result[:draft]
        end

        return result.merge(draft: normalize_draft(result[:draft]))
      end

      raise "No optimization provider produced a response for #{step_name}."
    end

    private

    def normalize_draft(draft)
      return nil unless draft

      tags = Array(draft[:tags]).map { |t| t.to_s.strip.downcase }.select(&:present?).uniq.first(12)

      {
        improved_title:                draft[:improved_title]&.strip.presence,
        improved_description:          draft[:improved_description].to_s.strip,
        tags:                          tags,
        positioning_recommendations:   draft[:positioning_recommendations]&.strip.presence,
        seo_notes:                     draft[:seo_notes]&.strip.presence,
        score:                         draft[:score] ? [[draft[:score].to_f, 0].max, 100].min : nil,
        rationale:                     draft[:rationale]&.strip.presence
      }
    end
  end
end
