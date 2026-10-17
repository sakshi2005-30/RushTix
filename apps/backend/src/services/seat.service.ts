import { Prisma, prisma } from "@repo/db";
import { AppError } from "../utils/AppError.js";

type Status = "AVAILABLE" | "BOOKED";
interface GetSeats{
    eventId:string,
    row?:number,
    status?:Status
}
interface SeatDetails{
    id:string,
    eventId:string,
    row:number,
    seatNo:number,
    status:"BOOKED"|"AVAILABLE",
    createdAt:Date
}
const seatsPerRow = 10;

/** Shared seat layout used by event creation and the protected seat-generation route. */
export const generateSeats = async (
    database: Pick<Prisma.TransactionClient, "seat">,
    eventId: string,
    totalSeats: number,
) => {
    const seats = Array.from({ length: totalSeats }, (_, index) => ({
        eventId,
        row: Math.floor(index / seatsPerRow) + 1,
        seatNo: (index % seatsPerRow) + 1,
    }));

    try {
        await database.seat.createMany({ data: seats });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
            throw new AppError("Seats have already been generated for this event", 409);
        }
        throw error;
    }

    return { eventId, totalSeatsCreated: seats.length };
};

export const createSeats = async (eventId: string) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, totalSeats: true },
    });
    if (!event) throw new AppError("Event not found", 404);

    return prisma.$transaction(async (tx) => {
        const existing = await tx.seat.findFirst({ where: { eventId } });
        if (existing) throw new AppError("Seats have already been generated for this event", 409);
        return generateSeats(tx, event.id, event.totalSeats);
    });
};
export const getSeats=async(data:GetSeats):Promise<SeatDetails[]>=>{
    try{
        const event=await prisma.event.findUnique({
            where:{
                id:data.eventId
            },
            select:{
                id:true,
                totalSeats:true
            }
        })
        if(!event){
            throw new AppError("Event not found", 404);
        }
        const res= await prisma.seat.findMany({
            where:{
                eventId:data.eventId,
                ...(data.row!==undefined &&{row:Number(data.row)}),
                ...(data.status!==undefined && {status:data.status})
            },
            select:{
                id:true,
                eventId:true,
                row:true,
                seatNo:true,
                status:true,
                createdAt:true
            }
        })
        return res;

    }
    catch(error){
        throw error
    }
}
