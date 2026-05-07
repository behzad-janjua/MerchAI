import { PrismaClient } from "@prisma/client";
import { LlmProviderConfig } from "../../../domain/entities/LlmProviderConfig.js";
import { LlmProviderConfigRepository } from "../../../domain/repositories/LlmProviderConfigRepository.js";
import { LlmProviderConfigMapper } from "../mappers/LlmProviderConfigMapper.js";

export class PrismaLlmProviderConfigRepository implements LlmProviderConfigRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: LlmProviderConfigMapper
  ) {}

  async findDefaultEnabled(): Promise<LlmProviderConfig | null> {
    const record = await this.prisma.llmProviderConfig.findFirst({
      where: { enabled: true },
      orderBy: [
        { isDefault: "desc" },
        { updatedAt: "desc" }
      ]
    });

    return record ? this.mapper.toDomain(record) : null;
  }
}
