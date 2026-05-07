# MerchAI

AI agent for Shopify product listing optimization built with TypeScript, Prisma, React, and PostgreSQL.

## What It Does

- Stores Shopify product listing data for analysis.
- Runs a multi-step agent pipeline over product data.
- Produces improved descriptions, tags, positioning notes, SEO notes, and quality scores.
- Provides a React interface for reviewing listings and optimization suggestions.

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- React + Vite

## Local Setup

```bash
npm install
npm run prisma:migrate
npm run dev:backend
```

Copy `.env.example` to `.env` and replace the database or LLM values for your machine.
