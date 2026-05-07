import { AgentRun } from "../../domain/entities/AgentRun.js";
import { ProductListing } from "../../domain/entities/ProductListing.js";
import { AgentRunRepository } from "../../domain/repositories/AgentRunRepository.js";
import { OptimizationSuggestionRepository } from "../../domain/repositories/OptimizationSuggestionRepository.js";
import { ListingAnalyzer } from "./StructuredListingAnalyzer.js";
import { OptimizationSuggestionGenerator } from "./OptimizationSuggestionGenerator.js";
import { ProductSnapshotTool } from "./ProductSnapshot.js";

export class ProductOptimizationPipeline {
  constructor(
    private readonly snapshotTool: ProductSnapshotTool,
    private readonly analyzer: ListingAnalyzer,
    private readonly generator: OptimizationSuggestionGenerator,
    private readonly agentRuns: AgentRunRepository,
    private readonly suggestions: OptimizationSuggestionRepository
  ) {}

  async run(product: ProductListing): Promise<AgentRun> {
    const agentRun = await this.agentRuns.createRunning(product.id, { pipeline: "product-listing-optimization" });

    try {
      const snapshot = this.snapshotTool.execute(product);
      const analysis = this.analyzer.analyze(snapshot);
      const draft = await this.generator.generate(snapshot, analysis);

      await this.suggestions.create({
        productListingId: product.id,
        agentRunId: agentRun.id,
        ...draft
      });

      return this.agentRuns.markCompleted(agentRun.id, analysis);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown pipeline failure";
      return this.agentRuns.markFailed(agentRun.id, message);
    }
  }
}
