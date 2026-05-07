import { Request, Response } from "express";
import {
  ProductListingInputSchema,
  ProductListingUpdateSchema
} from "../../../application/dto/ProductListingSchemas.js";
import { CreateProductListingService } from "../../../application/services/CreateProductListingService.js";
import { DeleteProductListingService } from "../../../application/services/DeleteProductListingService.js";
import { GetProductListingService } from "../../../application/services/GetProductListingService.js";
import { ImportProductListingsCsvService } from "../../../application/services/ImportProductListingsCsvService.js";
import { ListProductListingsService } from "../../../application/services/ListProductListingsService.js";
import { OptimizeProductListingService } from "../../../application/services/OptimizeProductListingService.js";
import { UpdateProductListingService } from "../../../application/services/UpdateProductListingService.js";
import { MultipartCsvExtractor } from "../MultipartCsvExtractor.js";
import { AgentRunSerializer } from "../serializers/AgentRunSerializer.js";
import { ProductListingSerializer } from "../serializers/ProductListingSerializer.js";

export class ProductListingController {
  constructor(
    private readonly listProductListings: ListProductListingsService,
    private readonly getProductListing: GetProductListingService,
    private readonly createProductListing: CreateProductListingService,
    private readonly updateProductListing: UpdateProductListingService,
    private readonly deleteProductListing: DeleteProductListingService,
    private readonly optimizeProductListing: OptimizeProductListingService,
    private readonly importProductListingsCsv: ImportProductListingsCsvService,
    private readonly csvExtractor: MultipartCsvExtractor,
    private readonly productListingSerializer: ProductListingSerializer,
    private readonly agentRunSerializer: AgentRunSerializer
  ) {}

  index = async (_request: Request, response: Response): Promise<void> => {
    const listings = await this.listProductListings.execute();
    response.json(listings.map((listing) => this.productListingSerializer.serialize(listing)));
  };

  show = async (request: Request, response: Response): Promise<void> => {
    const listing = await this.getProductListing.execute(this.paramId(request));
    response.json(this.productListingSerializer.serialize(listing));
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const input = ProductListingInputSchema.parse(request.body);
    const listing = await this.createProductListing.execute(input);
    response.status(201).json(this.productListingSerializer.serialize(listing));
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const input = ProductListingUpdateSchema.parse(request.body);
    const listing = await this.updateProductListing.execute(this.paramId(request), input);
    response.json(this.productListingSerializer.serialize(listing));
  };

  destroy = async (request: Request, response: Response): Promise<void> => {
    await this.deleteProductListing.execute(this.paramId(request));
    response.status(204).send();
  };

  optimize = async (request: Request, response: Response): Promise<void> => {
    const run = await this.optimizeProductListing.execute(this.paramId(request));
    response.status(201).json(this.agentRunSerializer.serialize(run));
  };

  importCsv = async (request: Request, response: Response): Promise<void> => {
    const csv = this.csvExtractor.extract(request);
    const result = await this.importProductListingsCsv.execute(csv);
    response.status(201).json(result);
  };

  private paramId(request: Request): string {
    const value = request.params.id;
    return Array.isArray(value) ? value[0] : value;
  }
}
