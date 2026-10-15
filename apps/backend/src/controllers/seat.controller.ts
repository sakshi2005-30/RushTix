import { Request,Response,NextFunction } from "express";
import * as seatService from "../services/seat.service.js";
export const createSeats=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const id=req.params.eventId
        if(!id || typeof id!=="string"){
            return res.status(400).json({
                message:"eventId is invalid"
            })
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
            return res.status(400).json({
                message:"eventId is invalid"
            })
        }
       const { row: rawRow, status: rawStatus } = req.query;

    let row: number | undefined;
    if (rawRow !== undefined) {
      const parsed = typeof rawRow === "string" ? Number(rawRow) : NaN;
      if (!Number.isInteger(parsed) || parsed < 1) {
        return res.status(400).json({ message: "row must be a positive integer" });
      }
      row = parsed;
    }

    let status: "AVAILABLE" | "BOOKED" | undefined;
    if (rawStatus !== undefined) {
      if (rawStatus !== "AVAILABLE" && rawStatus !== "BOOKED") {
        return res.status(400).json({ message: "status must be AVAILABLE or BOOKED" });
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