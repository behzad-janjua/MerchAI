import express, { Router } from "express";
import { ProductListingController } from "../controllers/ProductListingController.js";
import { asyncHandler } from "../AsyncHandler.js";

export class ProductListingRoutes {
  constructor(private readonly controller: ProductListingController) {}

  build(): Router {
    const router = Router();
    const csvUploadBody = express.raw({
      limit: "5mb",
      type: (request) => {
        const contentType = request.headers["content-type"] ?? "";
        return contentType.includes("multipart/form-data") ||
          contentType.includes("text/csv") ||
          contentType.includes("application/octet-stream");
      }
    });

    router.get("/", asyncHandler(this.controller.index));
    router.post("/", asyncHandler(this.controller.create));
    router.post("/import-csv", csvUploadBody, asyncHandler(this.controller.importCsv));
    router.get("/:id", asyncHandler(this.controller.show));
    router.patch("/:id", asyncHandler(this.controller.update));
    router.delete("/:id", asyncHandler(this.controller.destroy));
    router.post("/:id/optimize", asyncHandler(this.controller.optimize));

    return router;
  }
}
