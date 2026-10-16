import { Router } from "express";
import { cancelBooking, createBooking, getUserBookings } from "../controllers/booking.controller.js";
import { middleware } from "../middlewares/auth.middleware.js";
const router:Router=Router();
router.post("/:eventId",middleware,createBooking);
router.get("/",middleware,getUserBookings);
router.put("/:bookingId",middleware,cancelBooking)
export default router;