
import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { middleware } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  deleteEvent,
  getEvent,
  updateEvent,
} from "../controllers/event.controller.js";

const router: Router = Router();

router.post("/", middleware, adminMiddleware, createEvent);
router.get("/", getEvent);
router.get("/:id", getEvent);
router.put("/:id", middleware, adminMiddleware, updateEvent);
router.delete("/:id", middleware, adminMiddleware, deleteEvent);

export default router;
