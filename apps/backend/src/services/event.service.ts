
import { prisma } from "@repo/db";

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
}

export const createEvent = async (data: {
    name: string;
    description: string;
    venue: string;
    date: Date;
}) => {
    const { name, description, venue, date } = data;

    return prisma.event.create({
        data: {
            name,
            description,
            venue,
            date: new Date(date),
        },
        select: {
            id: true,
            name: true,
            description: true,
            venue: true,
            date: true,
        },
    });
};

export const getEvents = async (query: GetEventQuery) => {
    const { id, search, page = 1, limit = 10, venue } = query;

    if (id) {
        const event = await prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                venue: true,
                date: true,
            },
        });

        if (!event) {
            throw new Error("No event found with this id");
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
        },
    });
};

export const deleteEvent = async (id: string) => {
    const event = await prisma.event.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            venue: true,
            date: true,
        },
    });

    if (!event) {
        throw new Error("No event with this id present");
    }

    await prisma.event.delete({ where: { id } });

    return event;
};

export const updateEvent = async (id: string, data: Update) => {
    const event = await prisma.event.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!event) {
        throw new Error("No event present with this id");
    }

    return prisma.event.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.venue !== undefined && { venue: data.venue }),
            ...(data.date !== undefined && { date: data.date }),
        },
        select: {
            id: true,
            name: true,
            description: true,
            venue: true,
            date: true,
        },
    });
};
