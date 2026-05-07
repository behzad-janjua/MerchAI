# MerchAI

Portfolio MVP for a Shopify Product Listing Optimization Agent. MerchAI imports product listings, runs a specialized multi-step AI agent pipeline, tracks estimated LLM cost, and presents actionable listing improvements in a React workspace.

## What It Does

- Imports Shopify export CSVs or a simple demo CSV template.
- Stores Shopify-ready product listing data in PostgreSQL with Prisma.
- Runs six agent steps: listing snapshot, SEO analysis, copy analysis, tag analysis, audience/positioning analysis, and final synthesis.
- Stores every step prompt, response, provider, model, token count, estimated cost, status, and error.
- Produces improved titles, descriptions, tags, positioning notes, SEO notes, rationale, and quality scores.
- Falls back to deterministic demo behavior when no external LLM API key is configured.
- Shows listing editing, CSV import, agent step findings, final suggestions, and cost summary in the frontend.

## Architecture

- `backend/`: TypeScript, Express, Prisma, PostgreSQL.
- `backend/src/application/agent/`: agent pipeline, prompt builder, provider registry, fallback provider, OpenAI-compatible provider.
- `backend/src/application/csv/`: CSV parser for Shopify and simple demo imports.
- `backend/src/domain/`: entities and repository interfaces.
- `backend/src/infrastructure/prisma/`: Prisma repositories and mappers.
- `backend/src/presentation/http/`: controllers, routes, serializers, request parsing.
- `frontend/`: React + Vite workspace with modular API client, form mapper, and presentational components.

## Requirements

- Node.js 20+
- Yarn 1.22+
- PostgreSQL
- A local `.env` file copied from `.env.example`

## Setup

Install dependencies:

```bash
yarn install
```

For a fresh local setup, copy the env file and run the setup script. This installs dependencies from `yarn.lock`, runs Prisma migrations, generates the Prisma client, and seeds demo data.

```bash
cp .env.example .env
yarn setup
```

Seed demo data again when needed:

```bash
yarn seed
```

Start the full dev workspace:

```bash
yarn dev
```

Build and run the production-style local preview:

```bash
yarn start
```

Useful focused commands:

```bash
yarn build
yarn test:backend
yarn prisma:studio
```

`yarn seen` is also available as a typo-friendly alias for `yarn seed`.

To run only one side of the app:

```bash
yarn dev:backend
yarn dev:frontend
```

Default URLs:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/merchai?schema=public"
API_PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:4000/api"

# Provider/model/cost settings live in Prisma LlmProviderConfig.
# Seed creates a Gemini Free Demo provider that reads this key when available.
GEMINI_API_KEY=
LLM_API_URL=
LLM_API_KEY=
```

Provider, model, base URL, API-key env var name, and token-cost settings are stored in the Prisma `LlmProviderConfig` table. The seed creates `gemini-free-demo`, an OpenAI-compatible Gemini example using `gemini-2.5-flash`. It reads `GEMINI_API_KEY` when present and intentionally uses fake nonzero demo costs so the Cost panel has useful numbers even for a free portfolio walkthrough.

If no enabled provider config exists, or the configured provider is unavailable, the deterministic fallback provider keeps the demo usable.

## CSV Import

Endpoint:

```http
POST /api/product-listings/import-csv
Content-Type: multipart/form-data
```

The frontend sends a file upload from the Listings panel. The backend also accepts raw `text/csv`.

Simple demo template:

```csv
title,description,tags,price,vendor,productType,handle
Camp Mug,Enamel mug for weekend coffee,"mug|camp|gift",18,Merch Co,Drinkware,camp-mug
```

Shopify export columns are auto-detected when headers such as `Body (HTML)`, `Variant Price`, or `Product Category` are present. Common mapped fields include:

- `Handle`
- `Title`
- `Body (HTML)`
- `Vendor`
- `Type`
- `Tags`
- `Variant Price`
- `Variant Inventory Qty`

Import responses include `createdCount`, `updatedCount`, detected `format`, and row-level validation errors.

## API Highlights

- `GET /api/product-listings`
- `POST /api/product-listings`
- `POST /api/product-listings/import-csv`
- `POST /api/product-listings/:id/optimize`
- `GET /api/agent-runs/:id`
- `GET /api/agent-runs/cost-summary`

## Demo Walkthrough

1. Start PostgreSQL, the backend, and the frontend.
2. Import a Shopify export or the simple CSV template from the Listings panel.
3. Select a listing and optionally edit product data.
4. Click Optimize.
5. Review the stored agent step findings before the final recommendation.
6. Check estimated total cost, provider/model mix, and per-run cost in the Cost panel.

## Portfolio Talking Points

- Multi-step AI agent: the pipeline decomposes listing optimization into specialized prompt steps and stores intermediate reasoning artifacts.
- Provider abstraction: provider/model/cost settings live in Prisma, so new LLMs can be added as provider config records.
- Cost visibility: `AgentStepRun` captures provider/model usage, token counts, and estimated cost for dashboard reporting.
- Shopify data readiness: CSV import supports Shopify exports and a clean demo template with row-level validation.
- Full-stack implementation: Express/Prisma/PostgreSQL backend with a React/Vite review workspace.
- Maintainable shape: controllers, services, repositories, mappers, API clients, and presentational components stay separated.

## Verification

```bash
yarn prisma:generate
yarn build
yarn test:backend
```
