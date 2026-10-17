import {prisma} from "@repo/db";
import { AppError } from "../utils/AppError.js";
interface BookingDetails{
    eventId:string,
    userId:string,
    seatId:string,
}
interface CancelBooking{
    bookingId:string,
    userId:string
}
type BookingStatus = "CONFIRMED" | "CANCELLED";
interface Booking{
    id: string,
    userId: string,
    eventId: string,
    seatId: string,
    status: BookingStatus,
    createdAt: Date,
}
export const createBooking=async(data:BookingDetails):Promise<Booking>=>{
    try{
        return prisma.$transaction(async(tx)=>{
            const seats=await tx.seat.updateMany({
                where:{
                    eventId:data.eventId,
                    id:data.seatId,
                    status:"AVAILABLE"
                },
                data:{
                    status:"BOOKED"
                }
            })
            if(seats.count===0){
                 throw new AppError(
                    "Seat is unavailable or does not belong to this event",
                    409
                );
            }
            const booking=await tx.booking.create({
                data:{
                    eventId:data.eventId,
                    userId:data.userId,
                    seatId:data.seatId
                },
                select: {
                id: true,
                userId: true,
                eventId: true,
                seatId: true,
                status: true,
                createdAt: true,
            },
            })
            return booking;
        }, {
        maxWait: 10000,
        timeout: 10000,
    })
    }
    catch(error){
        throw error;
    }
}
export const getUsesBookings=async(userId:string):Promise<Booking[]>=>{
    try{
       return await prisma.booking.findMany({
            where:{
                userId
            },
            select:{
                id: true,
                userId: true,
                eventId: true,
                seatId: true,
                status: true,
                createdAt: true,
            }
        })
       
    }
    catch(error){
        throw error;
    }
}
export const cancelBooking = async (
  bookingId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CANCELLED") {
     throw new AppError("Booking is already cancelled", 409);
    }

    const result=await tx.booking.updateMany({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
    if (result.count=== 0) {
        throw new AppError("Booking is already cancelled", 409);
    }

    await tx.seat.update({
      where: { id: booking.seatId },
      data: { status: "AVAILABLE" },
    });

    return {
      bookingId: booking.id,
      status: "CANCELLED",
    };
  });
};