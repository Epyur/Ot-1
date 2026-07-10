import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { submitSurvey } from "../services/survey.service";

export function getQuestions(_req: Request, res: Response): void {
  const questions = [
    { name: "lastName", label: "Фамилия", type: "text", required: true, placeholder: "Иванов" },
    { name: "firstName", label: "Имя", type: "text", required: true, placeholder: "Иван" },
    { name: "patronymic", label: "Отчество", type: "text", required: false, placeholder: "Иванович" },
    { name: "birthDate", label: "Дата рождения", type: "date", required: true, placeholder: "" },
    { name: "phone", label: "Телефон", type: "text", required: true, placeholder: "+7-999-123-45-67" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "ivan@example.com" },
    { name: "organization", label: "Организация", type: "text", required: true, placeholder: "ООО Ромашка" },
  ];
  res.json(questions);
}

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
    res.status(201).json({ id: answer.id, message: "Спасибо! Анкета сохранена" });
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