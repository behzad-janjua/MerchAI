# MerchAI

AI agent for Shopify product listing optimization built with Ruby on Rails, React, and PostgreSQL.

## What It Does

- Stores Shopify product listing data for analysis.
- Runs a multi-step agent pipeline over product data.
- Produces improved descriptions, tags, positioning notes, SEO notes, and quality scores.
- Provides a React interface for reviewing listings and optimization suggestions.

## Stack

- Rails 6.1 API
- PostgreSQL
- React + Vite

## Local Setup

```bash
bundle install
bin/rails db:setup
bin/rails server
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` if you want to wire in an external LLM provider.
