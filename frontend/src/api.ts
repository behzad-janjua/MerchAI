import type { AgentRun, CostSummary, ListingFormData, ProductListing } from "./types";

const BASE = "/api/v1";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  contentType = "application/json"
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = contentType;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listings: {
    list:   ()              => request<ProductListing[]>("GET", "/product_listings"),
    get:    (id: string)    => request<ProductListing>("GET", `/product_listings/${id}`),
    create: (data: Partial<ListingFormData>) => request<ProductListing>("POST", "/product_listings", { listing: toApiPayload(data) }),
    update: (id: string, data: Partial<ListingFormData>) => request<ProductListing>("PATCH", `/product_listings/${id}`, { listing: toApiPayload(data) }),
    delete: (id: string)    => request<void>("DELETE", `/product_listings/${id}`),
    optimize: (id: string)  => request<AgentRun>("POST", `/product_listings/${id}/optimize`),
    importCsv: (csv: string) => request<{ createdCount: number; updatedCount: number; errorCount: number; format: string }>("POST", "/product_listings/import_csv", csv, "text/csv"),
  },
  agentRuns: {
    get:         (id: string) => request<AgentRun>("GET", `/agent_runs/${id}`),
    costSummary: ()           => request<CostSummary>("GET", "/agent_runs/cost_summary"),
  },
};

function toApiPayload(data: Partial<ListingFormData>): Record<string, unknown> {
  return {
    title:           data.title,
    shopifyProductId: data.shopifyProductId || null,
    handle:          data.handle || null,
    vendor:          data.vendor || null,
    productType:     data.productType || null,
    description:     data.description || null,
    tags:            data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    price:           data.price ? parseFloat(data.price) : null,
    currency:        data.currency || "USD",
    inventoryQuantity: data.inventoryQuantity ? parseInt(data.inventoryQuantity, 10) : null,
    rawData:         data.audience ? { audience: data.audience } : {},
  };
}
