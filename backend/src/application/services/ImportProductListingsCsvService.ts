import {
  CsvImportRowError,
  ProductListingCsvParser
} from "../csv/ProductListingCsvParser.js";
import { ProductListingRepository } from "../../domain/repositories/ProductListingRepository.js";

export type ProductListingCsvImportResult = {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  format: "shopify" | "simple";
  errors: CsvImportRowError[];
};

export class ImportProductListingsCsvService {
  constructor(
    private readonly productListings: ProductListingRepository,
    private readonly parser: ProductListingCsvParser
  ) {}

  async execute(csv: string): Promise<ProductListingCsvImportResult> {
    const parsed = this.parser.parse(csv);
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const result = await this.productListings.upsertImported(row);

      if (result.created) {
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    return {
      createdCount,
      updatedCount,
      errorCount: parsed.errors.length,
      format: parsed.format,
      errors: parsed.errors
    };
  }
}
