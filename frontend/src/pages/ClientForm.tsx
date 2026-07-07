import React, { useState } from "react";
import { FormInput } from "../components/FormInput";
import { submitSurvey } from "../api/client.api";
import { validateEmail, validatePhone, validateBirthDate, validateRequired } from "../utils/validation";

interface FormErrors {
  lastName?: string;
  firstName?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  organization?: string;
}

const initialFormState = {
  lastName: "",
  firstName: "",
  patronymic: "",
  birthDate: "",
  phone: "",
  email: "",
  organization: "",
};

export function ClientForm() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(form.lastName)) newErrors.lastName = "Фамилия обязательна";
    if (!validateRequired(form.firstName)) newErrors.firstName = "Имя обязательно";
    if (!validateBirthDate(form.birthDate)) newErrors.birthDate = "Формат: ГГГГ-ММ-ДД";
    if (!validatePhone(form.phone)) newErrors.phone = "Телефон обязателен";
    if (!validateEmail(form.email)) newErrors.email = "Некорректный email";
    if (!validateRequired(form.organization)) newErrors.organization = "Организация обязательна";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      const result = await submitSurvey(form);
      setStatus("success");
      setServerMessage(result.message);
      setForm(initialFormState);
    } catch (err: unknown) {
      setStatus("error");
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string; details?: Array<{ message: string }> } } };
        setServerMessage(axiosErr.response?.data?.error || "Ошибка при отправке");
        if (axiosErr.response?.data?.details) {
          const serverErrors: FormErrors = {};
          axiosErr.response.data.details.forEach((d) => {
            if (d.message) serverErrors.lastName = d.message;
          });
          setErrors(serverErrors);
        }
      } else {
        setServerMessage("Ошибка соединения с сервером");
      }
    }
  };

  return (
    <div className="container">
      <h1>Анкета заказчика</h1>
      <form onSubmit={handleSubmit} className="survey-form">
        <FormInput label="Фамилия" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required placeholder="Иванов" />
        <FormInput label="Имя" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required placeholder="Иван" />
        <FormInput label="Отчество" name="patronymic" value={form.patronymic} onChange={handleChange} placeholder="Иванович" />
        <FormInput label="Дата рождения" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} error={errors.birthDate} required />
        <FormInput label="Телефон" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required placeholder="+7-999-123-45-67" />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required placeholder="ivan@example.com" />
        <FormInput label="Организация" name="organization" value={form.organization} onChange={handleChange} error={errors.organization} required placeholder="ООО Ромашка" />

        <button type="submit" disabled={status === "loading"} className="submit-btn">
          {status === "loading" ? "Отправка..." : "Отправить анкету"}
        </button>

        {status === "success" && <div className="success-message">{serverMessage}</div>}
        {status === "error" && <div className="error-message">{serverMessage}</div>}
      </form>
    </div>
  );
}