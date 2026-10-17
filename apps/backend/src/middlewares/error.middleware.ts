
import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
    err: Error & { statusCode?: number },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode =
        typeof err.statusCode === "number" &&
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Internal server error"
                : err.message,
    });
};
