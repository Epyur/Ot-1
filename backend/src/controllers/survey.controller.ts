import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { submitSurvey } from "../services/survey.service";

const surveySchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  patronymic: z.string().optional().default(""),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата рождения должна быть в формате ГГГГ-ММ-ДД"),
  phone: z.string().min(5, "Телефон обязателен"),
  email: z.string().email("Некорректный email"),
  organization: z.string().min(1, "Организация обязательна"),
});

export async function createSurvey(req: Request, res: Response): Promise<void> {
  try {
    const parsed = surveySchema.parse(req.body);
    const answer = await submitSurvey(parsed);
    res.status(201).json({ id: answer.id, message: "Анкета успешно сохранена" });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e: z.ZodIssue) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}