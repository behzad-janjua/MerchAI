module Agent
  class ProductOptimizationPipeline
    PIPELINE_STEPS = STEP_NAMES.freeze

    def initialize(
      snapshot_tool: ProductSnapshotTool.new,
      analyzer: StructuredListingAnalyzer.new,
      prompt_builder: OptimizationPromptBuilder.new,
      generator: OptimizationSuggestionGenerator.new
    )
      @snapshot_tool  = snapshot_tool
      @analyzer       = analyzer
      @prompt_builder = prompt_builder
      @generator      = generator
    end

    def run(listing)
      agent_run = AgentRun.create!(
        product_listing: listing,
        status: "running",
        started_at: Time.current,
        metadata: { pipeline: "product-listing-optimization" }
      )

      snapshot       = @snapshot_tool.execute(listing)
      analysis       = @analyzer.analyze(snapshot)
      prior_responses = {}
      final_draft    = nil

      PIPELINE_STEPS.each_with_index do |step_name, index|
        prompt   = @prompt_builder.build_step(step_name, snapshot, analysis, prior_responses)
        step_run = AgentStepRun.create!(
          agent_run: agent_run,
          step_name: step_name,
          step_order: index + 1,
          status: "running",
          prompt: prompt
        )

        begin
          result = @generator.generate(
            step_name: step_name,
            prompt: prompt,
            snapshot: snapshot,
            analysis: analysis,
            prior_responses: prior_responses
          )

          step_run.update!(
            status: "completed",
            response: result[:response],
            provider: result[:provider],
            model: result[:model],
            input_tokens: result[:input_tokens],
            output_tokens: result[:output_tokens],
            estimated_cost: result[:estimated_cost]
          )

          prior_responses[step_name] = result[:response]
          final_draft = result[:draft] if step_name == "final_synthesis"
        rescue => e
          step_run.update!(status: "failed", error_message: e.message.truncate(1000))
          raise
        end
      end

      raise "Final synthesis did not produce a valid optimization suggestion." unless final_draft

      OptimizationSuggestion.create!(
        product_listing: listing,
        agent_run: agent_run,
        improved_title: final_draft[:improved_title],
        improved_description: final_draft[:improved_description],
        tags: final_draft[:tags],
        positioning_recommendations: final_draft[:positioning_recommendations],
        seo_notes: final_draft[:seo_notes],
        score: final_draft[:score],
        rationale: final_draft[:rationale]
      )

      agent_run.update!(
        status: "completed",
        completed_at: Time.current,
        analysis: analysis.merge(step_findings: prior_responses)
      )
      agent_run.reload
    rescue => e
      agent_run&.update!(
        status: "failed",
        completed_at: Time.current,
        error_message: e.message.truncate(1000)
      )
      agent_run&.reload
    end
  end
end
