import jwt from "jsonwebtoken"
import { Request,Response,NextFunction } from "express"
import { AppError } from "../utils/AppError.js";
export const middleware=async(req:Request,res:Response,next:NextFunction)=>{
    const token=req.cookies?.token;
    if(!token){
       if (!token) {
    throw new AppError("Please login to continue", 401);
}
    }
    
    const secret=process.env.JWT_SECRET;
    if(!secret){
        return next(new Error("JWT_SECRET is not configured"));
    }
    try{
        const decoded=jwt.verify(token,secret);
       if (typeof decoded === "string" || typeof decoded.id !== "string") {
            throw new AppError("Invalid authentication token", 401);
        }
        req.userId=decoded.id;
        return next();
    } catch {
         return next(
        new AppError("Invalid or expired token. Please log in again.", 401)
    );
    }
}
