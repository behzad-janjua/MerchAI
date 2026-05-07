import {
  AgentRun,
  AgentRunCostSummary,
  CsvImportResult,
  ProductListing,
  ProductListingInput
} from "../types";

export class ProductListingApi {
  constructor(private readonly baseUrl: string) {}

  async list(): Promise<ProductListing[]> {
    return this.request<ProductListing[]>("/product-listings");
  }

  async create(input: ProductListingInput): Promise<ProductListing> {
    return this.request<ProductListing>("/product-listings", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async update(id: string, input: Partial<ProductListingInput>): Promise<ProductListing> {
    return this.request<ProductListing>(`/product-listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  }

  async optimize(id: string): Promise<AgentRun> {
    return this.request<AgentRun>(`/product-listings/${id}/optimize`, {
      method: "POST"
    });
  }

  async importCsv(file: File): Promise<CsvImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<CsvImportResult>("/product-listings/import-csv", {
      method: "POST",
      body: formData
    });
  }

  async getAgentRun(id: string): Promise<AgentRun> {
    return this.request<AgentRun>(`/agent-runs/${id}`);
  }

  async costSummary(): Promise<AgentRunCostSummary> {
    return this.request<AgentRunCostSummary>("/agent-runs/cost-summary");
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = init.body instanceof FormData
      ? init.headers
      : {
          "Content-Type": "application/json",
          ...init.headers
        };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Request failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
