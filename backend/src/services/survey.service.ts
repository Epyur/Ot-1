import { IAnswer, IAnswerInput } from "../models/survey.model";
import { addRecord, readData } from "../storage/jsonStorage";
import crypto from "crypto";

export async function submitSurvey(input: IAnswerInput): Promise<IAnswer> {
  const answer: IAnswer = {
    id: crypto.randomUUID(),
    lastName: input.lastName,
    firstName: input.firstName,
    patronymic: input.patronymic || "",
    birthDate: input.birthDate,
    phone: input.phone,
    email: input.email,
    organization: input.organization,
    createdAt: new Date().toISOString(),
  };

  await addRecord(answer);
  return answer;
}

export async function getAllSurveys(): Promise<IAnswer[]> {
  return readData<IAnswer>();
}