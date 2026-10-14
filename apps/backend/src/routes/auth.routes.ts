import {signup,signin,logout} from "../controllers/auth.controller.js"
import { Router } from "express"
const router:Router=Router();
router.post("/signup",signup);
router.post("/signin",signin);
router.post("/logout",logout);
export default router;