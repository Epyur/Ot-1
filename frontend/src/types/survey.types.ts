export interface IAnswer {
  id: string;
  lastName: string;
  firstName: string;
  patronymic: string;
  birthDate: string;
  phone: string;
  email: string;
  organization: string;
  createdAt: string;
}

export interface IAnswerInput {
  lastName: string;
  firstName: string;
  patronymic?: string;
  birthDate: string;
  phone: string;
  email: string;
  organization: string;
}