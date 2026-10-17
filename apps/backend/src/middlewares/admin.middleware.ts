import { me } from "../services/auth.service.js";
import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
export const adminMiddleware=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        if(!userId){
            if (!userId) {
            throw new AppError("Not authorized", 401);
        }
        }
        const user=await me(userId);
        if (user.role !== "ADMIN") {
            throw new AppError("Access denied. Admins only.", 403);
        }
     next();
    }
    catch(error){
      next(error);  
    }
}
