import { me } from "../services/auth.service.js";
import { Request,Response,NextFunction } from "express";
export const adminMiddleware=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userId=req.userId;
        if(!userId){
            return res.status(400).json({
                message:"Not authorized"
            })
        }
        const user=await me(userId);
        if(user.role!=='ADMIN'){
            return res.status(400).json({
                message:"Access denied.Admins only."
            })
        }
        next();
    }
    catch(error){
      next(error);  
    }
}