import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 ? "Internal server error" : err.message,
  });
};