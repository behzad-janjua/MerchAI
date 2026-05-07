import { Router } from "express";
import { AgentRunController } from "../controllers/AgentRunController.js";
import { asyncHandler } from "../AsyncHandler.js";

export class AgentRunRoutes {
  constructor(private readonly controller: AgentRunController) {}

  build(): Router {
    const router = Router();
    router.get("/:id", asyncHandler(this.controller.show));
    return router;
  }
}
