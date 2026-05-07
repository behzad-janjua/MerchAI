import { PrismaClient } from "@prisma/client";

export class PrismaClientFactory {
  private client: PrismaClient | null = null;

  getClient(): PrismaClient {
    if (!this.client) {
      this.client = new PrismaClient();
    }

    return this.client;
  }
}
