import cors from "cors";
import express, { Express } from "express";
import { ApplicationContainer } from "./container/ApplicationContainer.js";
import { AgentRunRoutes } from "./presentation/http/routes/AgentRunRoutes.js";
import { ProductListingRoutes } from "./presentation/http/routes/ProductListingRoutes.js";

export class App {
  constructor(private readonly container: ApplicationContainer) {}

  build(): Express {
    const app = express();

    app.use(cors({ origin: this.container.environment.frontendOrigin }));
    app.use(express.json({ limit: "1mb" }));

    app.get("/health", (_request, response) => {
      response.json({ ok: true });
    });

    app.use(
      "/api/product-listings",
      new ProductListingRoutes(this.container.productListingController).build()
    );
    app.use("/api/agent-runs", new AgentRunRoutes(this.container.agentRunController).build());
    app.use(this.container.errorMiddleware.handle.bind(this.container.errorMiddleware));

    return app;
  }
}
