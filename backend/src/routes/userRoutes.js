import { Router } from "express";
import { listAgents } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// All user routes require an authenticated session
router.use(protect);

// Staff directory, used by assignment dropdowns in the UI
router.get("/agents", authorize("agent", "admin"), listAgents);

export default router;
