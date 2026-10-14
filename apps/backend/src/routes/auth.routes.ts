import {signup,signin,logout, me} from "../controllers/auth.controller.js"
import { middleware } from "../middlewares/auth.middleware.js";
import { Router } from "express"
const router:Router=Router();
router.post("/signup",signup);
router.post("/signin",signin);
router.post("/logout",logout);
router.get("/me",middleware,me);
export default router;