module Api
  module V1
    class AgentRunsController < BaseController
      def show
        run = AgentRun.includes(:agent_step_runs).find(params[:id])
        render json: run.as_api_json
      end

      def cost_summary
        totals = AgentStepRun
          .where.not(estimated_cost: nil)
          .group(:provider, :model)
          .select(
            :provider,
            :model,
            "SUM(estimated_cost) AS estimated_cost",
            "SUM(input_tokens)   AS total_input_tokens",
            "SUM(output_tokens)  AS total_output_tokens",
            "COUNT(*)            AS step_run_count"
          )

        total_cost  = totals.sum { |r| r.estimated_cost.to_f }
        total_steps = AgentStepRun.count

        render json: {
          totalEstimatedCost: total_cost.round(6),
          totalStepRuns: total_steps,
          byProviderModel: totals.map do |row|
            {
              provider:       row.provider,
              model:          row.model,
              estimatedCost:  row.estimated_cost.to_f.round(6),
              inputTokens:    row.total_input_tokens.to_i,
              outputTokens:   row.total_output_tokens.to_i,
              stepRunCount:   row.step_run_count.to_i
            }
          end
        }
      end
    end
  end
end
