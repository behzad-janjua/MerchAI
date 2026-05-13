class AgentStepRun < ApplicationRecord
  belongs_to :agent_run

  validates :step_name, presence: true
  validates :step_order, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :prompt, presence: true
  validates :status, inclusion: { in: AgentRun::STATUSES }

  before_validation :set_defaults

  def as_api_json
    {
      id: id,
      agentRunId: agent_run_id,
      stepName: step_name,
      stepOrder: step_order,
      prompt: prompt,
      response: response,
      provider: provider,
      model: model,
      inputTokens: input_tokens,
      outputTokens: output_tokens,
      estimatedCost: estimated_cost,
      status: status,
      errorMessage: error_message,
      metadata: metadata || {},
      createdAt: created_at,
      updatedAt: updated_at
    }
  end

  private

  def set_defaults
    self.status ||= "queued"
    self.metadata ||= {}
  end
end
