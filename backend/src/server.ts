import express from "express";
import cors from "cors";
import surveyRoutes from "./routes/survey.routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/survey", surveyRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorMiddleware);

export default app;