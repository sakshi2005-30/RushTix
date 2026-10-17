import {prisma} from "@repo/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import "dotenv/config";
import {AppError }from "../utils/AppError.js"
interface SignUpResponse{
    id:string,
    name:string,
    email:string,

    role :"ADMIN"| "CUSTOMER",
    createdAt:Date
}
export const signup=async(data:{
    name:string,
    email:string,
    password:string
}):Promise<SignUpResponse>=>{
    try{
        const {name,email,password}=data;
        const existingUser=await prisma.user.findFirst({
            where:{
                email
            }
        })
        if (existingUser) {
            throw new AppError(
                "An account with this email already exists",
                409
            );
        }      
        
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                createdAt:true
            }
        })
        
        return user;
      
    }
    catch(error){
        throw error;
    }
}
export const signin=async(data:{
    email:string,
    password:string
})=>{
    try{
        const {email,password}=data;
        const user=await prisma.user.findFirst({
            where:{
                email
            },
            select:{
                id:true,
                password:true,
                name:true,
                email:true,
                createdAt:true
            }
        })
       if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError("Invalid email or password", 401);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
    catch(error){
        throw error;
    }
}
export const me=async(id:string):Promise<SignUpResponse>=>{
    try{
        const user=await prisma.user.findFirst({
            where:{
                id
            },
            select:{
                id:true,
                name:true,
                email:true,
                createdAt:true,
                role:true
            }
        })
        if (!user) {
            throw new AppError("User not found", 404);
        }
            return user;

    }
    catch(error){
        throw error;
    }
}
