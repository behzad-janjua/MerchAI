import { Environment } from "../config/Environment.js";
import { FallbackOptimizationProvider } from "../application/agent/FallbackOptimizationProvider.js";
import { LlmOptimizationProvider } from "../application/agent/LlmOptimizationProvider.js";
import { OptimizationPromptBuilder } from "../application/agent/OptimizationPromptBuilder.js";
import { OptimizationSuggestionGenerator } from "../application/agent/OptimizationSuggestionGenerator.js";
import { ProductOptimizationPipeline } from "../application/agent/ProductOptimizationPipeline.js";
import { ProductSnapshotTool } from "../application/agent/ProductSnapshot.js";
import { StructuredListingAnalyzer } from "../application/agent/StructuredListingAnalyzer.js";
import { CreateProductListingService } from "../application/services/CreateProductListingService.js";
import { DeleteProductListingService } from "../application/services/DeleteProductListingService.js";
import { GetAgentRunService } from "../application/services/GetAgentRunService.js";
import { GetProductListingService } from "../application/services/GetProductListingService.js";
import { ListProductListingsService } from "../application/services/ListProductListingsService.js";
import { OptimizeProductListingService } from "../application/services/OptimizeProductListingService.js";
import { UpdateProductListingService } from "../application/services/UpdateProductListingService.js";
import { PrismaClientFactory } from "../infrastructure/prisma/PrismaClientFactory.js";
import { AgentRunMapper } from "../infrastructure/prisma/mappers/AgentRunMapper.js";
import { OptimizationSuggestionMapper } from "../infrastructure/prisma/mappers/OptimizationSuggestionMapper.js";
import { ProductListingMapper } from "../infrastructure/prisma/mappers/ProductListingMapper.js";
import { PrismaAgentRunRepository } from "../infrastructure/prisma/repositories/PrismaAgentRunRepository.js";
import { PrismaOptimizationSuggestionRepository } from "../infrastructure/prisma/repositories/PrismaOptimizationSuggestionRepository.js";
import { PrismaProductListingRepository } from "../infrastructure/prisma/repositories/PrismaProductListingRepository.js";
import { AgentRunController } from "../presentation/http/controllers/AgentRunController.js";
import { ProductListingController } from "../presentation/http/controllers/ProductListingController.js";
import { ErrorMiddleware } from "../presentation/http/ErrorMiddleware.js";
import { AgentRunSerializer } from "../presentation/http/serializers/AgentRunSerializer.js";
import { ProductListingSerializer } from "../presentation/http/serializers/ProductListingSerializer.js";

export class ApplicationContainer {
  readonly environment = new Environment();
  readonly errorMiddleware = new ErrorMiddleware();
  readonly productListingController: ProductListingController;
  readonly agentRunController: AgentRunController;

  constructor() {
    const prisma = new PrismaClientFactory().getClient();
    const productListings = new PrismaProductListingRepository(prisma, new ProductListingMapper());
    const agentRuns = new PrismaAgentRunRepository(prisma, new AgentRunMapper());
    const suggestions = new PrismaOptimizationSuggestionRepository(prisma, new OptimizationSuggestionMapper());

    const promptBuilder = new OptimizationPromptBuilder();
    const generator = new OptimizationSuggestionGenerator([
      new LlmOptimizationProvider(this.environment, promptBuilder),
      new FallbackOptimizationProvider()
    ]);

    const pipeline = new ProductOptimizationPipeline(
      new ProductSnapshotTool(),
      new StructuredListingAnalyzer(),
      generator,
      agentRuns,
      suggestions
    );

    const productListingSerializer = new ProductListingSerializer();
    const agentRunSerializer = new AgentRunSerializer();

    this.productListingController = new ProductListingController(
      new ListProductListingsService(productListings),
      new GetProductListingService(productListings),
      new CreateProductListingService(productListings),
      new UpdateProductListingService(productListings),
      new DeleteProductListingService(productListings),
      new OptimizeProductListingService(productListings, pipeline),
      productListingSerializer,
      agentRunSerializer
    );

    this.agentRunController = new AgentRunController(
      new GetAgentRunService(agentRuns),
      agentRunSerializer
    );
  }
}
