import { AgentRun, ProductListing, ProductListingInput } from "../types";

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

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Request failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
