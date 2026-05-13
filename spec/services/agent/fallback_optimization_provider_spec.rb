require "rails_helper"

RSpec.describe Agent::FallbackOptimizationProvider do
  subject(:provider) { described_class.new }

  let(:snapshot) do
    Agent::ProductSnapshot.new(
      id: "listing-1",
      shopify_product_id: nil,
      title: "Camp Mug",
      handle: "camp-mug",
      vendor: "Merch Co",
      product_type: "Drinkware",
      description: "A sturdy mug.",
      tags: ["mug"],
      price: 18,
      currency: "USD",
      inventory_quantity: 12,
      raw_data: {}
    )
  end

  let(:analysis) do
    {
      score: 65,
      issues: ["Description is short."],
      opportunities: ["Expand the description with buyer outcomes."],
      attributes_detected: {
        has_vendor: true, has_product_type: true,
        has_inventory: true, tag_count: 1, description_length: 13
      }
    }
  end

  describe "#generate" do
    it "returns zero cost metadata" do
      result = provider.generate(
        step_name: "seo_analysis",
        prompt: "Analyze SEO",
        snapshot: snapshot,
        analysis: analysis
      )

      expect(result[:provider]).to eq("fallback")
      expect(result[:estimated_cost]).to eq(0)
      expect(result[:input_tokens]).to be > 0
      expect(result[:output_tokens]).to be > 0
    end

    it "returns step findings as bullet points" do
      result = provider.generate(
        step_name: "seo_analysis",
        prompt: "Analyze SEO",
        snapshot: snapshot,
        analysis: analysis
      )
      expect(result[:response]).to match(/searchable product terms/i)
    end

    it "produces a final draft for final_synthesis" do
      result = provider.generate(
        step_name: "final_synthesis",
        prompt: "Return JSON",
        snapshot: snapshot,
        analysis: analysis,
        prior_responses: { "seo_analysis" => "- Add product category terms" }
      )

      expect(result[:draft]).not_to be_nil
      expect(result[:draft][:improved_description]).to match(/Why customers will love it/i)
      expect(result[:draft][:score]).to eq(77)
    end

    it "returns no draft for non-synthesis steps" do
      result = provider.generate(
        step_name: "tag_analysis",
        prompt: "Analyze tags",
        snapshot: snapshot,
        analysis: analysis
      )
      expect(result[:draft]).to be_nil
    end

    Agent::STEP_NAMES.each do |step|
      it "handles step '#{step}' without raising" do
        expect {
          provider.generate(step_name: step, prompt: "prompt", snapshot: snapshot, analysis: analysis)
        }.not_to raise_error
      end
    end
  end
end
