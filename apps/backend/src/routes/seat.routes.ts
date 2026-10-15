import { middleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { createSeats, getSeats } from "../controllers/seat.controller.js";
import { Router } from "express";
const router:Router=Router();
router.post("/:eventId/seats",middleware,adminMiddleware,createSeats);
 router.get("/:eventId/seats",getSeats);
// router.get("/:eventId/:seatId")
export default router;