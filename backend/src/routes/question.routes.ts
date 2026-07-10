import { Router } from "express";
import { getQuestions } from "../controllers/survey.controller";

const router = Router();

router.get("/", getQuestions);

export default router;
