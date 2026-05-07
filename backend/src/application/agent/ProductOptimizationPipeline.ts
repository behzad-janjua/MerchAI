import { AgentRun } from "../../domain/entities/AgentRun.js";
import { ProductListing } from "../../domain/entities/ProductListing.js";
import { AgentRunRepository } from "../../domain/repositories/AgentRunRepository.js";
import { AgentStepRunRepository } from "../../domain/repositories/AgentStepRunRepository.js";
import { OptimizationSuggestionRepository } from "../../domain/repositories/OptimizationSuggestionRepository.js";
import { OptimizationDraft } from "./OptimizationDraft.js";
import { ListingAnalyzer } from "./StructuredListingAnalyzer.js";
import { AgentStepName } from "./OptimizationProvider.js";
import { PromptBuilder } from "./OptimizationPromptBuilder.js";
import { OptimizationSuggestionGenerator } from "./OptimizationSuggestionGenerator.js";
import { ProductSnapshotTool } from "./ProductSnapshot.js";

const pipelineSteps: AgentStepName[] = [
  "listing_snapshot",
  "seo_analysis",
  "copy_analysis",
  "tag_analysis",
  "audience_positioning_analysis",
  "final_synthesis"
];

export class ProductOptimizationPipeline {
  constructor(
    private readonly snapshotTool: ProductSnapshotTool,
    private readonly analyzer: ListingAnalyzer,
    private readonly promptBuilder: PromptBuilder,
    private readonly generator: OptimizationSuggestionGenerator,
    private readonly agentRuns: AgentRunRepository,
    private readonly agentStepRuns: AgentStepRunRepository,
    private readonly suggestions: OptimizationSuggestionRepository
  ) {}

  async run(product: ProductListing): Promise<AgentRun> {
    const agentRun = await this.agentRuns.createRunning(product.id, { pipeline: "product-listing-optimization" });

    try {
      const snapshot = this.snapshotTool.execute(product);
      const analysis = this.analyzer.analyze(snapshot);
      const stepResponses: Record<string, string> = {};
      let finalDraft: OptimizationDraft | null = null;

      for (const [index, stepName] of pipelineSteps.entries()) {
        const prompt = this.promptBuilder.buildStep(stepName, snapshot, analysis, stepResponses);
        const stepRun = await this.agentStepRuns.createRunning({
          agentRunId: agentRun.id,
          stepName,
          stepOrder: index + 1,
          prompt
        });

        try {
          const result = await this.generator.generate(stepName, prompt, snapshot, analysis, stepResponses);
          await this.agentStepRuns.markCompleted(stepRun.id, {
            response: result.response,
            provider: result.provider,
            model: result.model,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            estimatedCost: result.estimatedCost
          });
          stepResponses[stepName] = result.response;

          if (stepName === "final_synthesis") {
            finalDraft = result.draft ?? null;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown step failure";
          await this.agentStepRuns.markFailed(stepRun.id, message);
          throw error;
        }
      }

      if (!finalDraft) {
        throw new Error("Final synthesis did not produce a valid optimization suggestion.");
      }

      await this.suggestions.create({
        productListingId: product.id,
        agentRunId: agentRun.id,
        ...finalDraft
      });

      return this.agentRuns.markCompleted(agentRun.id, {
        ...analysis,
        stepFindings: stepResponses
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown pipeline failure";
      return this.agentRuns.markFailed(agentRun.id, message);
    }
  }
}
