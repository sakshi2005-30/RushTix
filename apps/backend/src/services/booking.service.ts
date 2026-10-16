import {prisma} from "@repo/db";
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
                throw new Error("No seat available");
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
      throw new Error("BOOKING_NOT_FOUND");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("BOOKING_ALREADY_CANCELLED");
    }

    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

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