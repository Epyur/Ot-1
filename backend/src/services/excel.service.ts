import ExcelJS from "exceljs";
import { IAnswer } from "../models/survey.model";

export async function generateExcel(answers: IAnswer[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Анкеты заказчиков");

  worksheet.columns = [
    { header: "№", key: "index", width: 6 },
    { header: "Фамилия", key: "lastName", width: 20 },
    { header: "Имя", key: "firstName", width: 20 },
    { header: "Отчество", key: "patronymic", width: 20 },
    { header: "Дата рождения", key: "birthDate", width: 16 },
    { header: "Телефон", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 30 },
    { header: "Организация", key: "organization", width: 30 },
    { header: "Дата создания", key: "createdAt", width: 22 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  answers.forEach((answer, index) => {
    worksheet.addRow({
      index: index + 1,
      lastName: answer.lastName,
      firstName: answer.firstName,
      patronymic: answer.patronymic,
      birthDate: answer.birthDate,
      phone: answer.phone,
      email: answer.email,
      organization: answer.organization,
      createdAt: answer.createdAt,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}