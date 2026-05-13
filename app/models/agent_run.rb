class AgentRun < ApplicationRecord
  STATUSES = %w[queued running completed failed].freeze

  belongs_to :product_listing
  has_many :agent_step_runs, -> { order(:step_order) }, dependent: :destroy
  has_one :optimization_suggestion, dependent: :destroy

  validates :status, inclusion: { in: STATUSES }

  before_validation :set_defaults

  def as_api_json
    {
      id: id,
      productListingId: product_listing_id,
      status: status,
      startedAt: started_at,
      completedAt: completed_at,
      errorMessage: error_message,
      analysis: analysis || {},
      metadata: metadata || {},
      steps: agent_step_runs.map(&:as_api_json),
      createdAt: created_at,
      updatedAt: updated_at
    }
  end

  private

  def set_defaults
    self.status ||= "queued"
    self.analysis ||= {}
    self.metadata ||= {}
  end
end
