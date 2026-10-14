import express from "express"
import "dotenv/config"
import {prisma} from "@repo/db"
const app=express();

const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})