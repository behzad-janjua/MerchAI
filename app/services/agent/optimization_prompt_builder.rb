module Agent
  STEP_NAMES = %w[
    listing_snapshot
    seo_analysis
    copy_analysis
    tag_analysis
    audience_positioning_analysis
    final_synthesis
  ].freeze

  class OptimizationPromptBuilder
    def build_step(step_name, snapshot, analysis, prior_responses)
      parts = [
        "You are a Shopify product listing optimization agent.",
        "Be specific, practical, and concise. Use the provided product data only.",
        "",
        "Product snapshot: #{snapshot.to_h.to_json}",
        "",
        "Structured rules analysis: #{analysis.to_json}"
      ]

      if prior_responses.any?
        parts << ""
        parts << "Previous step findings: #{prior_responses.to_json}"
      end

      parts << ""
      parts << step_instruction(step_name)
      parts.join("\n")
    end

    private

    def step_instruction(step_name)
      instructions = {
        "listing_snapshot" =>
          "Step: listing snapshot. Summarize the listing's current merchandisable facts, gaps, and likely buyer intent in 4-6 bullets.",
        "seo_analysis" =>
          "Step: SEO analysis. Identify search intent, title keyword opportunities, missing product/category terms, and SEO risks in 4-6 bullets.",
        "copy_analysis" =>
          "Step: copy analysis. Review the title and description for clarity, benefit language, specificity, trust signals, and conversion gaps in 4-6 bullets.",
        "tag_analysis" =>
          "Step: tag analysis. Recommend tag themes for product type, occasion, buyer, style, and use case. Keep findings actionable.",
        "audience_positioning_analysis" =>
          "Step: audience and positioning analysis. Name the likely audience, primary value proposition, and best positioning angle in 4-6 bullets.",
        "final_synthesis" =>
          "Step: final synthesis. Return only valid JSON with keys improvedTitle, improvedDescription, tags, positioningRecommendations, seoNotes, score, rationale. Use the previous findings to create a ready-to-review Shopify recommendation."
      }
      instructions.fetch(step_name, "Step: #{step_name}. Analyze the product.")
    end
  end
end
