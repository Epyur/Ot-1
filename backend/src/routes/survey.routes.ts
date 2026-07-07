import { Router } from "express";
import { createSurvey } from "../controllers/survey.controller";

const router = Router();

router.post("/", createSurvey);

export default router;