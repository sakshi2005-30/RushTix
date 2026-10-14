import { Response,Request,NextFunction } from "express";
import * as authService from "../services/auth.service.js"
import jwt from "jsonwebtoken";
const createToken=(id:string,res:Response)=>{
    const secret=process.env.JWT_SECRET;
    if(!secret){
        throw new Error("JWT_SECRET is not configured");

    }
    const token=jwt.sign({id},secret,{expiresIn:"24h"});
    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax" as const,
        maxAge:24*60*60*1000

    })
}
export const signup =async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const response=await authService.signup(req.body);
        createToken(response.id,res);
        res.status(201).json({
            data:response
        })
    }
    catch(error){
       // next(error);
       console.log(error);
       res.status(500).json({
        message:"server error"
       })
    }
}
export const signin=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const response=await authService.signin(req.body);
        res.status(201).json({
            data:response
        })
    }
    catch(error){
        next(error);
    }
}
export const logout=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        res.clearCookie("token");
        return res.status(200).json({
            message:"Logged off successfully"
        })
    }
    catch(error){
        next(error);
    }
}