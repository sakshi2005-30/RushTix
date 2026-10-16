import {prisma} from "@repo/db";

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
export const createSeats=async(eventId:string)=>{
    try{
        const event=await prisma.event.findUnique({
            where:{
                id:eventId
            },
            select:{
                id:true,
                totalSeats:true
            }
        })
        if(!event){
            throw new Error("The event doesn't exists");
        }
        const checkIfExists=await prisma.seat.findFirst({
            where:{
                eventId:event.id
            }
        })
        if(checkIfExists){
            throw new Error("The seats are already generated");
        }
        const seatsPerRow=10;
        const seats=Array.from({length:event.totalSeats},(_,index)=>(
            {eventId,
            row:Math.floor(index/seatsPerRow)+1,
            seatNo:(index%seatsPerRow)+1
        }

        ))
        const create=await prisma.seat.createMany({
         data: seats,
        });
        return {
              eventId: event.id,
            totalSeatsCreated: seats.length,
        }

    }
    catch(error){
        throw error;
    }
}
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
            throw new Error("The event doesn't exists");
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