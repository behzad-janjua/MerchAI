import { NextFunction, Request, Response } from "express";

export type AsyncRoute = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (route: AsyncRoute) =>
  (request: Request, response: Response, next: NextFunction): void => {
    route(request, response, next).catch(next);
  };
