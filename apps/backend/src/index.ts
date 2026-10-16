import express from "express"
import {globalErrorHandler} from "./middlewares/error.middleware.js"
import authRoutes from "./routes/auth.routes.js"
import eventRoutes from "./routes/event.routes.js"
import seatRoutes from "./routes/seat.routes.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import bookingRoutes from "./routes/booking.routes.js"
const app=express();
app.use(express.json())
app.use(cookieParser());
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/events",eventRoutes)
app.use("/api/v1/events",seatRoutes)
app.use("/api/v1/bookings",bookingRoutes);

const PORT=process.env.PORT ||5000
app.use(globalErrorHandler)
console.log("hello")
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})