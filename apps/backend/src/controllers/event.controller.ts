
import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service.js";
import { AppError } from "../utils/AppError.js";

export const createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const body = req.body as Record<string, unknown>;
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const description = typeof body?.description === "string" ? body.description.trim() : "";
        const venue = typeof body?.venue === "string" ? body.venue.trim() : "";
        const date = typeof body?.date === "string" ? new Date(body.date) : null;
        const totalSeats = body?.totalSeats;

        if (!name || !description || !venue || !date || Number.isNaN(date.getTime())) {
            throw new AppError("Name, description, venue, and a valid date are required", 400);
        }
        if (typeof totalSeats !== "number" || !Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > 1000) {
            throw new AppError("Total seats must be a whole number between 1 and 1000", 400);
        }

        const response = await eventService.createEvent({ name, description, venue, date, totalSeats });
        return res.status(201).json({ data: response });
    } catch (error) {
        next(error);
    }
};

export const getEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            throw new AppError(
                "Page must be a positive integer and limit must be between 1 and 100",
                400
            );
        }

        const response = await eventService.getEvents({
            id: typeof req.params.id === "string"
                ? req.params.id
                : undefined,
            search: typeof req.query.search === "string"
                ? req.query.search
                : undefined,
            venue: typeof req.query.venue === "string"
                ? req.query.venue
                : "",
            page,
            limit,
        });

        return res.status(200).json({ data: response });
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id;

        if (typeof id !== "string" || !id.trim()) {
            throw new AppError("A valid event ID is required", 400);
        }

        const response = await eventService.deleteEvent(id);
        return res.status(200).json({ data: response });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id;

        if (typeof id !== "string" || !id.trim()) {
           throw new AppError("A valid event ID is required", 400);
        }

        const body = req.body as Record<string, unknown>;
        if (body.date !== undefined && (typeof body.date !== "string" || Number.isNaN(new Date(body.date).getTime()))) {
            return res.status(400).json({
                success: false,
                message: "Invalid event date",
            });
        }

        for (const field of ["name", "description", "venue"] as const) {
            if (body[field] !== undefined && (typeof body[field] !== "string" || !body[field].trim())) {
                return res.status(400).json({ success: false, message: `${field} must be a non-empty string` });
            }
        }
        if (body.totalSeats !== undefined && (typeof body.totalSeats !== "number" || !Number.isInteger(body.totalSeats) || body.totalSeats < 1 || body.totalSeats > 1000)) {
            return res.status(400).json({ success: false, message: "Total seats must be a whole number between 1 and 1000" });
        }

        const data = {
            name: typeof body.name === "string"
                ? body.name.trim()
                : undefined,
            description: typeof body.description === "string"
                ? body.description.trim()
                : undefined,
            venue: typeof body.venue === "string"
                ? body.venue.trim()
                : undefined,
            date: typeof body.date === "string"
                ? new Date(body.date)
                : undefined,
            totalSeats: typeof body.totalSeats === "number" ? body.totalSeats : undefined,
        };

        const response = await eventService.updateEvent(id, data);
        return res.status(200).json({ data: response });
    } catch (error) {
        next(error);
    }
};
