import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import { Request,Response,NextFunction } from "express"
export const middleware=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const token=req.cookies?.token;
        if(!token){
            return res.status(400).json({
                message:"Please login to continue"
            })
        }
        const secret=process.env.JWT_SECRET||"";
        const decoded=jwt.verify(token,secret);
         if (typeof decoded === "string" || typeof decoded.id !== "string") {
            res.status(401).json({
            
                message: "Invalid authentication token",
            });
            return;
         }
         req.userId=decoded.id;
         next();

    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message:"Invalid or expired token. Please log in again."
        })
    }
}