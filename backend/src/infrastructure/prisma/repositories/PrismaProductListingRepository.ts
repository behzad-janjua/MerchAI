import { Prisma, PrismaClient } from "@prisma/client";
import {
  ProductListing,
  ProductListingId,
  ProductListingInput,
  ProductListingWithSuggestion
} from "../../../domain/entities/ProductListing.js";
import { ProductListingRepository } from "../../../domain/repositories/ProductListingRepository.js";
import { ProductListingMapper } from "../mappers/ProductListingMapper.js";

export class PrismaProductListingRepository implements ProductListingRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: ProductListingMapper
  ) {}

  async findAll(): Promise<ProductListingWithSuggestion[]> {
    const records = await this.prisma.productListing.findMany({
      include: {
        suggestions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return records.map((record) => this.mapper.toDomainWithSuggestion(record));
  }

  async findById(id: ProductListingId): Promise<ProductListing | null> {
    const record = await this.prisma.productListing.findUnique({ where: { id } });
    return record ? this.mapper.toDomain(record) : null;
  }

  async create(input: ProductListingInput): Promise<ProductListing> {
    const record = await this.prisma.productListing.create({ data: this.toCreateData(input) });
    return this.mapper.toDomain(record);
  }

  async update(id: ProductListingId, input: Partial<ProductListingInput>): Promise<ProductListing> {
    const record = await this.prisma.productListing.update({
      where: { id },
      data: this.toUpdateData(input)
    });

    return this.mapper.toDomain(record);
  }

  async delete(id: ProductListingId): Promise<void> {
    await this.prisma.productListing.delete({ where: { id } });
  }

  private toCreateData(input: ProductListingInput): Prisma.ProductListingUncheckedCreateInput {
    return {
      shopifyProductId: input.shopifyProductId,
      title: input.title,
      handle: input.handle,
      vendor: input.vendor,
      productType: input.productType,
      description: input.description,
      tags: input.tags,
      price: input.price,
      currency: input.currency,
      inventoryQuantity: input.inventoryQuantity,
      rawData: input.rawData as Prisma.InputJsonValue | undefined
    };
  }

  private toUpdateData(input: Partial<ProductListingInput>): Prisma.ProductListingUncheckedUpdateInput {
    return {
      shopifyProductId: input.shopifyProductId,
      title: input.title,
      handle: input.handle,
      vendor: input.vendor,
      productType: input.productType,
      description: input.description,
      tags: input.tags,
      price: input.price,
      currency: input.currency,
      inventoryQuantity: input.inventoryQuantity,
      rawData: input.rawData as Prisma.InputJsonValue | undefined
    };
  }
}
