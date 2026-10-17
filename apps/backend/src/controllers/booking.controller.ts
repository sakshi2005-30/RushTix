import { Response,Request,NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import * as bookingService from "../services/booking.service.js";
export const createBooking=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        const eventId=req.params.eventId;
        const {seatId}=req.body;
        if (!userId) {
        throw new AppError("You must be logged in to book a seat", 401);
    }
        if (typeof eventId !== "string" || !eventId) {
           throw new AppError("Invalid event ID", 400);
        }

        if (typeof seatId !== "string" || !seatId.trim()) {
            throw new AppError("A valid seat ID is required", 400);
        
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
           throw new AppError("Unauthorized user", 401);
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
export const cancelBooking=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        const bookingId=req.params.bookingId;
        if(!userId || typeof userId!=="string"){
           throw new AppError("Invalid booking ID", 400);

        }
        if(!bookingId || typeof bookingId!=="string"){
            return res.status(400).json({
                message:"Invalid booking id"
            })
        }
        const response=await bookingService.cancelBooking(bookingId,userId);
        return res.status(200).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}