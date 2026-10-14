import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { middleware } from "../middlewares/auth.middleware.js";
import { createEvent, getEvent } from "../controllers/event.controller.js";

const router:Router=Router();

router.post("/",middleware,adminMiddleware,createEvent)
router.get("/",getEvent);
// router.put("/",adminMiddleware,)
router.get("/:id",getEvent);
// router.delete("/",adminMiddleware,)
export default router