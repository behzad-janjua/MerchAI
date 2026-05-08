import { Environment } from "../config/Environment.js";
import { OptimizationPromptBuilder } from "../application/agent/OptimizationPromptBuilder.js";
import { OptimizationProviderRegistry } from "../application/agent/OptimizationProviderRegistry.js";
import { OptimizationSuggestionGenerator } from "../application/agent/OptimizationSuggestionGenerator.js";
import { ProductOptimizationPipeline } from "../application/agent/ProductOptimizationPipeline.js";
import { ProductSnapshotTool } from "../application/agent/ProductSnapshot.js";
import { StructuredListingAnalyzer } from "../application/agent/StructuredListingAnalyzer.js";
import { ProductListingCsvParser } from "../application/csv/ProductListingCsvParser.js";
import { CreateProductListingService } from "../application/services/CreateProductListingService.js";
import { DeleteProductListingService } from "../application/services/DeleteProductListingService.js";
import { GetAgentRunCostSummaryService } from "../application/services/GetAgentRunCostSummaryService.js";
import { GetAgentRunService } from "../application/services/GetAgentRunService.js";
import { GetProductListingService } from "../application/services/GetProductListingService.js";
import { ImportProductListingsCsvService } from "../application/services/ImportProductListingsCsvService.js";
import { ListProductListingsService } from "../application/services/ListProductListingsService.js";
import { OptimizeProductListingService } from "../application/services/OptimizeProductListingService.js";
import { UpdateProductListingService } from "../application/services/UpdateProductListingService.js";
import { PrismaClientFactory } from "../infrastructure/prisma/PrismaClientFactory.js";
import { AgentRunMapper } from "../infrastructure/prisma/mappers/AgentRunMapper.js";
import { AgentStepRunMapper } from "../infrastructure/prisma/mappers/AgentStepRunMapper.js";
import { LlmProviderConfigMapper } from "../infrastructure/prisma/mappers/LlmProviderConfigMapper.js";
import { OptimizationSuggestionMapper } from "../infrastructure/prisma/mappers/OptimizationSuggestionMapper.js";
import { ProductListingMapper } from "../infrastructure/prisma/mappers/ProductListingMapper.js";
import { PrismaAgentRunRepository } from "../infrastructure/prisma/repositories/PrismaAgentRunRepository.js";
import { PrismaAgentStepRunRepository } from "../infrastructure/prisma/repositories/PrismaAgentStepRunRepository.js";
import { PrismaLlmProviderConfigRepository } from "../infrastructure/prisma/repositories/PrismaLlmProviderConfigRepository.js";
import { PrismaOptimizationSuggestionRepository } from "../infrastructure/prisma/repositories/PrismaOptimizationSuggestionRepository.js";
import { PrismaProductListingRepository } from "../infrastructure/prisma/repositories/PrismaProductListingRepository.js";
import { AgentRunController } from "../presentation/http/controllers/AgentRunController.js";
import { ProductListingController } from "../presentation/http/controllers/ProductListingController.js";
import { ErrorMiddleware } from "../presentation/http/ErrorMiddleware.js";
import { MultipartCsvExtractor } from "../presentation/http/MultipartCsvExtractor.js";
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
    const agentStepRuns = new PrismaAgentStepRunRepository(prisma, new AgentStepRunMapper());
    const llmProviderConfigs = new PrismaLlmProviderConfigRepository(prisma, new LlmProviderConfigMapper());
    const suggestions = new PrismaOptimizationSuggestionRepository(prisma, new OptimizationSuggestionMapper());

    const promptBuilder = new OptimizationPromptBuilder();
    const generator = new OptimizationSuggestionGenerator(
      new OptimizationProviderRegistry(this.environment, llmProviderConfigs)
    );

    const pipeline = new ProductOptimizationPipeline(
      new ProductSnapshotTool(),
      new StructuredListingAnalyzer(),
      promptBuilder,
      generator,
      agentRuns,
      agentStepRuns,
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
      new ImportProductListingsCsvService(productListings, new ProductListingCsvParser()),
      new MultipartCsvExtractor(),
      productListingSerializer,
      agentRunSerializer
    );

    this.agentRunController = new AgentRunController(
      new GetAgentRunService(agentRuns),
      new GetAgentRunCostSummaryService(agentRuns),
      agentRunSerializer
    );
  }
}
