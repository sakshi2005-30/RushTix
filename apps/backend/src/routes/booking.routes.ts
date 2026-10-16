import { Router } from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { middleware } from "../middlewares/auth.middleware.js";
const router:Router=Router();
router.post("/:eventId",middleware,createBooking);
export default router;