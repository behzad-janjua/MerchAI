import { ProductListingInput } from "../../domain/entities/ProductListing.js";

export type CsvImportRowError = {
  row: number;
  errors: string[];
};

export type CsvParseResult = {
  rows: ProductListingInput[];
  errors: CsvImportRowError[];
  format: "shopify" | "simple";
};

type CsvRecord = Record<string, string>;

export class ProductListingCsvParser {
  parse(csv: string): CsvParseResult {
    const table = this.readCsv(csv);

    if (table.length === 0) {
      return { rows: [], errors: [{ row: 1, errors: ["CSV is empty."] }], format: "simple" };
    }

    const headers = table[0].map((header) => header.trim());
    const format = this.isShopify(headers) ? "shopify" : "simple";
    const rows: ProductListingInput[] = [];
    const errors: CsvImportRowError[] = [];

    table.slice(1).forEach((values, index) => {
      const rowNumber = index + 2;

      if (values.every((value) => !value.trim())) {
        return;
      }

      const record = this.toRecord(headers, values);
      const mapped = format === "shopify" ? this.mapShopify(record) : this.mapSimple(record);
      const rowErrors = this.validate(mapped, rowNumber);

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
      } else {
        rows.push(mapped);
      }
    });

    return { rows, errors, format };
  }

  private readCsv(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < csv.length; index += 1) {
      const char = csv[index];
      const next = csv[index + 1];

      if (char === "\"" && quoted && next === "\"") {
        cell += "\"";
        index += 1;
        continue;
      }

      if (char === "\"") {
        quoted = !quoted;
        continue;
      }

      if (char === "," && !quoted) {
        row.push(cell);
        cell = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        continue;
      }

      cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    return rows.filter((cells) => cells.some((cellValue) => cellValue.trim().length > 0));
  }

  private isShopify(headers: string[]): boolean {
    const normalized = new Set(headers.map((header) => this.key(header)));
    return normalized.has("bodyhtml") || normalized.has("variantprice") || normalized.has("productcategory");
  }

  private toRecord(headers: string[], values: string[]): CsvRecord {
    return headers.reduce<CsvRecord>((record, header, index) => {
      record[this.key(header)] = values[index]?.trim() ?? "";
      return record;
    }, {});
  }

  private mapShopify(record: CsvRecord): ProductListingInput {
    const tags = this.splitTags(record.tags);
    const price = this.optionalNumber(record.variantprice || record.price);
    const inventoryQuantity = this.optionalInteger(record.variantinventoryqty || record.inventoryquantity);

    return {
      shopifyProductId: this.optional(record.id || record.productid || record.shopifyproductid),
      title: record.title?.trim() ?? "",
      handle: this.optional(record.handle),
      vendor: this.optional(record.vendor),
      productType: this.optional(record.type || record.producttype || record.productcategory),
      description: this.optional(record.bodyhtml || record.description),
      tags,
      price,
      currency: this.optional(record.currency) ?? "USD",
      inventoryQuantity,
      rawData: {
        importFormat: "shopify",
        sourceRow: record
      }
    };
  }

  private mapSimple(record: CsvRecord): ProductListingInput {
    return {
      shopifyProductId: this.optional(record.shopifyproductid || record.productid || record.id),
      title: record.title?.trim() ?? "",
      handle: this.optional(record.handle),
      vendor: this.optional(record.vendor),
      productType: this.optional(record.producttype),
      description: this.optional(record.description),
      tags: this.splitTags(record.tags),
      price: this.optionalNumber(record.price),
      currency: this.optional(record.currency) ?? "USD",
      inventoryQuantity: this.optionalInteger(record.inventoryquantity || record.inventory),
      rawData: {
        importFormat: "simple",
        sourceRow: record
      }
    };
  }

  private validate(input: ProductListingInput, rowNumber: number): string[] {
    const errors: string[] = [];

    if (!input.title.trim()) {
      errors.push("title is required");
    }

    if (input.price !== null && input.price !== undefined && Number.isNaN(input.price)) {
      errors.push("price must be a valid number");
    }

    if (
      input.inventoryQuantity !== null &&
      input.inventoryQuantity !== undefined &&
      !Number.isInteger(input.inventoryQuantity)
    ) {
      errors.push("inventoryQuantity must be an integer");
    }

    if (!/^[A-Za-z]{3}$/.test(input.currency ?? "USD")) {
      errors.push("currency must be a 3-letter code");
    }

    return errors.map((error) => `Row ${rowNumber}: ${error}`);
  }

  private splitTags(value: string | undefined): string[] {
    if (!value) {
      return [];
    }

    return [...new Set(value.split(/[|,]/).map((tag) => tag.trim()).filter(Boolean))];
  }

  private optional(value: string | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private optionalNumber(value: string | undefined): number | null {
    if (!value?.trim()) {
      return null;
    }

    const parsed = Number(value.replace(/[$,]/g, ""));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  private optionalInteger(value: string | undefined): number | null {
    if (!value?.trim()) {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
  }

  private key(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
}
