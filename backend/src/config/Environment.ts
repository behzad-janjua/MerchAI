import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const EnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  LLM_API_URL: z.string().optional().default(""),
  LLM_API_KEY: z.string().optional().default(""),
  LLM_MODEL: z.string().optional().default("listing-optimizer")
});

export type EnvironmentValues = z.infer<typeof EnvironmentSchema>;

export class Environment {
  private readonly values: EnvironmentValues;

  constructor(source: NodeJS.ProcessEnv = process.env) {
    this.values = EnvironmentSchema.parse(source);
  }

  get databaseUrl(): string {
    return this.values.DATABASE_URL;
  }

  get apiPort(): number {
    return this.values.API_PORT;
  }

  get frontendOrigin(): string {
    return this.values.FRONTEND_ORIGIN;
  }

  get llmApiUrl(): string {
    return this.values.LLM_API_URL;
  }

  get llmApiKey(): string {
    return this.values.LLM_API_KEY;
  }

  get llmModel(): string {
    return this.values.LLM_MODEL;
  }
}
