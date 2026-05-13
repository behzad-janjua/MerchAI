module Agent
  class FallbackOptimizationProvider
    PROVIDER_NAME = "fallback"
    MODEL_NAME = "deterministic-merchandising-rules"

    def generate(step_name:, prompt:, snapshot:, analysis:, prior_responses: {})
      response = if step_name == "final_synthesis"
        draft(snapshot, analysis).to_json
      else
        findings(step_name, snapshot, analysis)
      end

      input_tokens  = estimate_tokens(prompt)
      output_tokens = estimate_tokens(response)

      {
        response: response,
        draft: step_name == "final_synthesis" ? draft(snapshot, analysis) : nil,
        provider: PROVIDER_NAME,
        model: MODEL_NAME,
        input_tokens: input_tokens,
        output_tokens: output_tokens,
        estimated_cost: 0.0
      }
    end

    private

    def draft(snapshot, analysis)
      product_type    = snapshot.product_type.presence || "Shopify Product"
      title           = snapshot.title.presence || product_type
      tags            = build_tags(snapshot, product_type)
      first_opp       = analysis[:opportunities]&.first || "Highlight the clearest buyer benefit."
      desc_base       = snapshot.description.presence || "A thoughtfully designed #{product_type}."
      improved_title  = title.downcase.include?(product_type.downcase) ? title : "#{title} - #{product_type}"

      {
        improved_title: improved_title,
        improved_description: [
          desc_base,
          "",
          "Why customers will love it: #{first_opp}",
          "Best for shoppers looking for #{product_type} with clear value, practical details, and easy gifting potential."
        ].join("\n"),
        tags: tags,
        positioning_recommendations:
          "#{title} should be positioned around the primary buyer benefit first, then supported with product details. #{first_opp}",
        seo_notes:
          "Lead with the product category, include use-case keywords naturally, and keep the title readable for shoppers.",
        score: [[analysis[:score].to_i + 12, 100].min, 0].max,
        rationale:
          "Generated from structured listing gaps and merchandising rules because no external LLM response was available."
      }
    end

    def findings(step_name, snapshot, analysis)
      product_type  = snapshot.product_type.presence || "product category"
      title         = snapshot.title.presence || "Untitled product"
      first_opp     = analysis[:opportunities]&.first || "Clarify the clearest customer benefit."

      lines = case step_name
      when "listing_snapshot"
        [
          "#{title} is listed as #{product_type} with #{snapshot.tags.length} tags.",
          snapshot.description.present? ?
            "Description length is #{snapshot.description.length} characters." :
            "Description is missing and should be expanded before merchandising.",
          "Primary opportunity: #{first_opp}"
        ]
      when "seo_analysis"
        [
          "Lead the title with searchable product terms around #{product_type}.",
          "Keep keywords readable and avoid stuffing repeated phrases.",
          analysis[:issues]&.find { |i| i.downcase.include?("title") } ||
            "Title has enough base context for search."
        ]
      when "copy_analysis"
        [
          snapshot.description.present? ?
            "Description exists, but should connect product facts to buyer outcomes." :
            "Description is missing, so conversion copy is the largest gap.",
          "Add concrete details such as material, fit, use case, care, size, or giftability where applicable.",
          first_opp
        ]
      when "tag_analysis"
        [
          "Keep existing strong tags: #{snapshot.tags.first(5).join(", ").presence || "none yet"}.",
          "Add product-type and intent tags for #{product_type}.",
          "Include audience, occasion, style, and use-case tags."
        ]
      when "audience_positioning_analysis"
        [
          "Likely audience: shoppers comparing #{product_type} options.",
          "Position around the primary buyer benefit first, then support with product specifics.",
          "Use simple language that works in both search snippets and collection pages."
        ]
      else
        ["No findings available for step #{step_name}."]
      end

      lines.map { |l| "- #{l}" }.join("\n")
    end

    def build_tags(snapshot, product_type)
      raw = snapshot.tags + [product_type, snapshot.vendor, "gift", "everyday", "quality", "bestseller"]
      raw.compact.map { |t| slugify(t.to_s) }.uniq.first(12)
    end

    def slugify(value)
      value.strip.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
    end

    def estimate_tokens(text)
      [(text.length / 4.0).ceil, 1].max
    end
  end
end
