import express from "express"
import authRoutes from "./routes/auth.routes.js"
import "dotenv/config";
const app=express();
app.use(express.json())
app.use("/api/v1/auth",authRoutes)

const PORT=process.env.PORT ||5000
console.log("hello")
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})