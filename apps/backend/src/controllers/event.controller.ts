
import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service.js";

export const createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await eventService.createEvent(req.body);
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
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
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

        if (typeof id !== "string") {
            return res.status(400).json({
                message: "ID should be a string",
            });
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

        if (typeof id !== "string") {
            return res.status(400).json({
                message: "The ID is not valid",
            });
        }

        const data = {
            name: typeof req.body.name === "string"
                ? req.body.name
                : undefined,
            description: typeof req.body.description === "string"
                ? req.body.description
                : undefined,
            venue: typeof req.body.venue === "string"
                ? req.body.venue
                : undefined,
            date: typeof req.body.date === "string"
                ? new Date(req.body.date)
                : undefined,
        };

        const response = await eventService.updateEvent(id, data);
        return res.status(200).json({ data: response });
    } catch (error) {
        next(error);
    }
};
