import { AppError } from "../utils/AppError.js";
import { prisma } from "@repo/db";
import { generateSeats } from "./seat.service.js";
interface GetEventQuery {
    id?: string;
    search?: string;
    page: number;
    limit: number;
    venue: string;
}

interface Update {
    name?: string;
    description?: string;
    venue?: string;
    date?: Date;
    totalSeats?: number
}

export const createEvent = async (data: {
    name: string;
    description: string;
    venue: string;
    date: Date;
    totalSeats:number
}) => {
    const { name, description, venue, date, totalSeats } = data;

    return prisma.$transaction(async (tx) => {
        const event = await tx.event.create({
            data: { name, description, venue, date, totalSeats },
            select: { id: true, name: true, description: true, venue: true, date: true, totalSeats: true },
        });
        await generateSeats(tx, event.id, event.totalSeats);
        return event;
    });
};

export const getEvents = async (query: GetEventQuery) => {
    const { id, search, page = 1, limit = 10, venue } = query;

    if (id) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
            throw new AppError("Invalid event ID", 400);
        }
        const event = await prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                venue: true,
                date: true,
                totalSeats:true
            },
        });

        if (!event) {
            throw new AppError("Event not found", 404);
        }


        return event;
    }

    return prisma.event.findMany({
        where: {
            ...(search && {
                name: { contains: search, mode: "insensitive" },
            }),
            ...(venue && {
                venue: { contains: venue, mode: "insensitive" },
            }),
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true,
            name: true,
            description: true,
            venue: true,
            date: true,
            totalSeats:true
        },
    });
};

export const deleteEvent = async (id: string) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { id },
                select: { id: true, name: true, description: true, venue: true, date: true, totalSeats: true },
            });
            if (!event) throw new AppError("Event not found", 404);

            const bookingCount = await tx.booking.count({ where: { eventId: id } });
            if (bookingCount > 0) {
                throw new AppError("This event has booking history and cannot be deleted", 409);
            }

            await tx.seat.deleteMany({ where: { eventId: id } });
            await tx.event.delete({ where: { id } });
            return event;
        });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && (error.code === "P2003" || error.code === "P2014")) {
            throw new AppError("This event has booking history and cannot be deleted", 409);
        }
        throw error;
    }
};

export const updateEvent = async (id: string, data: Update) => {
    const event = await prisma.event.findUnique({
        where: { id },
        select: { id: true, totalSeats: true },
    });

    if (!event) {
        throw new AppError("Event not found", 404);
    }

    if (data.totalSeats !== undefined && data.totalSeats !== event.totalSeats) {
        const seatCount = await prisma.seat.count({ where: { eventId: id } });
        if (seatCount > 0) {
            throw new AppError("Seat count cannot be changed after seats have been generated", 409);
        }
        throw new AppError("Seat count changes are not supported", 400);
    }

    return prisma.event.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.venue !== undefined && { venue: data.venue }),
            ...(data.date !== undefined && { date: data.date })
        },
        select: {
            id: true,
            name: true,
            description: true,
            venue: true,
            date: true,
            totalSeats:true
        },
    });
};
