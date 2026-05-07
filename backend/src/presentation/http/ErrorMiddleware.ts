import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { NotFoundError } from "../../domain/errors/NotFoundError.js";

export class ErrorMiddleware {
  handle(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
    if (error instanceof NotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }

    if (error instanceof ZodError) {
      response.status(422).json({
        error: "validation_failed",
        details: error.flatten()
      });
      return;
    }

    response.status(500).json({
      error: "internal_server_error",
      message: error instanceof Error ? error.message : "Unexpected error"
    });
  }
}
