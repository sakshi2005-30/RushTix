import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import * as seatService from "../services/seat.service.js";
export const createSeats=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const id=req.params.eventId
        if(!id || typeof id!=="string"){
           throw new AppError("Invalid event ID", 400);
        }
        const response=await seatService.createSeats(id);
        return res.status(201).json({
            data:response
        })

    }
    catch(error){
        next(error);
    }
}
export const getSeats=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const eventId=req.params.eventId
        if(!eventId || typeof eventId!=="string"){
           throw new AppError("Status must be AVAILABLE or BOOKED", 400);
        }
       const { row: rawRow, status: rawStatus } = req.query;

    let row: number | undefined;
    if (rawRow !== undefined) {
      const parsed = typeof rawRow === "string" ? Number(rawRow) : NaN;
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new AppError("row must be a positive integer",400);
       
      }
      row = parsed;
    }

    let status: "AVAILABLE" | "BOOKED" | undefined;
    if (rawStatus !== undefined) {
      if (rawStatus !== "AVAILABLE" && rawStatus !== "BOOKED") {
        throw new AppError("status must be AVAILABLE or BOOKED",400);
      }
      status = rawStatus; // narrowed to the literal union by the check above
    }

    const response = await seatService.getSeats({ eventId, row, status });
        return res.status(200).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}