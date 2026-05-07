import { Router } from "express";
import { ProductListingController } from "../controllers/ProductListingController.js";
import { asyncHandler } from "../AsyncHandler.js";

export class ProductListingRoutes {
  constructor(private readonly controller: ProductListingController) {}

  build(): Router {
    const router = Router();

    router.get("/", asyncHandler(this.controller.index));
    router.post("/", asyncHandler(this.controller.create));
    router.get("/:id", asyncHandler(this.controller.show));
    router.patch("/:id", asyncHandler(this.controller.update));
    router.delete("/:id", asyncHandler(this.controller.destroy));
    router.post("/:id/optimize", asyncHandler(this.controller.optimize));

    return router;
  }
}
