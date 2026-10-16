import { Response,Request,NextFunction } from "express";
import * as bookingService from "../services/booking.service.js";
export const createBooking=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        const eventId=req.params.eventId;
        const {seatId}=req.body;
        if (!userId) {
      return res.status(401).json({
        message: "You must be logged in to book a seat",
      });
    }

        if (typeof eventId !== "string" || !eventId) {
            return res.status(400).json({
                message: "Invalid eventId",
            });
        }

        if (typeof seatId !== "string" || !seatId.trim()) {
            return res.status(400).json({
                message: "A valid seatId is required",
            });
        }

        const booking = await bookingService.createBooking({
            userId,
            eventId,
            seatId,
        });

        return res.status(201).json({
            message: "Seat booked successfully",
            data: booking,
        });
    }
    catch(error){
        next(error);
    }
}
export const getUserBookings=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        if(!userId){
            return res.status(401).json({
                message:"Unauthorized user"
            })
        }
        const response=await bookingService.getUsesBookings(userId);
        return res.status(200).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}