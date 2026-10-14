import { Request,Response ,NextFunction} from "express";
import * as eventService from "../services/event.service.js"
export const createEvent=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const response=await eventService.createEvent(req.body);
        return res.status(201).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}
export const getEvent=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const response=await eventService.getEvents({
                  id: typeof req.params.id === "string" ? req.params.id : undefined,
            search: typeof req.query.search === "string"
                ? req.query.search
                : undefined,
            venue: typeof req.query.venue === "string"
                ? req.query.venue
                : "",
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,

        });
        res.status(200).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}