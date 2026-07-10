import express from "express";
import cors from "cors";
import questionRoutes from "./routes/question.routes";
import surveyRoutes from "./routes/survey.routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/question", questionRoutes);
app.use("/api/answers", surveyRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorMiddleware);

export default app;