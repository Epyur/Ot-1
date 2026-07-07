import { Router } from "express";
import { getAllResponses, exportExcel } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/responses", getAllResponses);
router.get("/export", exportExcel);

export default router;