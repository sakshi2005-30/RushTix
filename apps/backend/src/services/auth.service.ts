import {prisma} from "@repo/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import "dotenv/config";

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
        if(existingUser){
            throw new Error("User already exits")
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
        if(!user){
            throw new Error("No user present please signup!");
        }
        const compare=await bcrypt.compare(password,user.password);
        if(!compare){
            throw new Error("Email or password is wrong");
        }
        return user;
    }
    catch(error){
        throw error;
    }
}