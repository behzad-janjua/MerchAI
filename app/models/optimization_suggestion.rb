class OptimizationSuggestion < ApplicationRecord
  belongs_to :product_listing
  belongs_to :agent_run

  validates :improved_description, presence: true

  before_validation :set_defaults

  def as_api_json
    {
      id: id,
      productListingId: product_listing_id,
      agentRunId: agent_run_id,
      improvedTitle: improved_title,
      improvedDescription: improved_description,
      tags: tags || [],
      positioningRecommendations: positioning_recommendations,
      seoNotes: seo_notes,
      score: score,
      rationale: rationale,
      accepted: accepted,
      createdAt: created_at,
      updatedAt: updated_at
    }
  end

  private

  def set_defaults
    self.tags ||= []
    self.accepted = false if accepted.nil?
  end
end
