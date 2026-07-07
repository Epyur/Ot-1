import { IAnswer } from "../types/survey.types";

interface SurveyTableProps {
  surveys: IAnswer[];
}

export function SurveyTable({ surveys }: SurveyTableProps) {
  if (surveys.length === 0) {
    return <p className="no-data">Нет данных для отображения</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="survey-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Дата рождения</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Организация</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey, index) => (
            <tr key={survey.id}>
              <td>{index + 1}</td>
              <td>{survey.lastName}</td>
              <td>{survey.firstName}</td>
              <td>{survey.patronymic}</td>
              <td>{survey.birthDate}</td>
              <td>{survey.phone}</td>
              <td>{survey.email}</td>
              <td>{survey.organization}</td>
              <td>{new Date(survey.createdAt).toLocaleString("ru-RU")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}