import axios from "axios";
import { IAnswer } from "../types/survey.types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAdminToken(token: string): void {
  adminApi.defaults.headers["X-Admin-Token"] = token;
}

export async function getAllResponses(): Promise<IAnswer[]> {
  const response = await adminApi.get("/admin/responses");
  return response.data;
}

export function getExportUrl(): string {
  const token = adminApi.defaults.headers["X-Admin-Token"];
  return `${API_URL}/admin/export?token=${token}`;
}

export async function downloadExcel(): Promise<void> {
  const response = await adminApi.get("/admin/export", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `surveys_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}