import { Request, Response } from "express";
import { getAllSurveys } from "../services/survey.service";
import { generateExcel } from "../services/excel.service";

export async function getAllResponses(_req: Request, res: Response): Promise<void> {
  try {
    const surveys = await getAllSurveys();
    res.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function exportExcel(_req: Request, res: Response): Promise<void> {
  try {
    const surveys = await getAllSurveys();
    const buffer = await generateExcel(surveys);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="surveys_${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}