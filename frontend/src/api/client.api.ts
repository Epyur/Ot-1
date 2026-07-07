import axios from "axios";
import { IAnswerInput } from "../types/survey.types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function submitSurvey(data: IAnswerInput): Promise<{ id: string; message: string }> {
  const response = await api.post("/survey", data);
  return response.data;
}