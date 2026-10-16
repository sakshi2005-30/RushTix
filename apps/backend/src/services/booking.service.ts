import {prisma} from "@repo/db";
interface BookingDetails{
    eventId:string,
    userId:string,
    seatId:string
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