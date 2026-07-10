import React, { useState, useEffect } from "react";
import { FormInput } from "../components/FormInput";
import { getQuestions, submitSurvey, IQuestion } from "../api/client.api";
import { validateEmail, validatePhone, validateBirthDate, validateRequired } from "../utils/validation";

interface FormErrors {
  [key: string]: string | undefined;
}

export function ClientForm() {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getQuestions()
      .then((data) => {
        setQuestions(data);
        const initial: Record<string, string> = {};
        data.forEach((q) => { initial[q.name] = ""; });
        setForm(initial);
      })
      .catch(() => setLoadError("Не удалось загрузить вопросы анкеты"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    questions.forEach((q) => {
      if (q.name === "email" && form[q.name]) {
        if (!validateEmail(form[q.name])) newErrors[q.name] = "Некорректный email";
      } else if (q.name === "phone" && form[q.name]) {
        if (!validatePhone(form[q.name])) newErrors[q.name] = "Телефон обязателен";
      } else if (q.name === "birthDate" && form[q.name]) {
        if (!validateBirthDate(form[q.name])) newErrors[q.name] = "Формат: ГГГГ-ММ-ДД";
      } else if (q.required && !validateRequired(form[q.name] || "")) {
        newErrors[q.name] = `${q.label} обязательна`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      const result = await submitSurvey(form as unknown as import("../types/survey.types").IAnswerInput);
      setStatus("success");
      setServerMessage(result.message);
      const cleared: Record<string, string> = {};
      questions.forEach((q) => { cleared[q.name] = ""; });
      setForm(cleared);
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

  if (loadError) {
    return <div className="container"><div className="error-message">{loadError}</div></div>;
  }

  if (questions.length === 0) {
    return <div className="container"><div className="loading">Загрузка вопросов...</div></div>;
  }

  return (
    <div className="container">
      <h1>Анкета заказчика</h1>
      <form onSubmit={handleSubmit} className="survey-form">
        {questions.map((q) => (
          <FormInput
            key={q.name}
            label={q.label}
            name={q.name}
            type={q.type}
            value={form[q.name] || ""}
            onChange={handleChange}
            error={errors[q.name]}
            required={q.required}
            placeholder={q.placeholder}
          />
        ))}

        <button type="submit" disabled={status === "loading"} className="submit-btn">
          {status === "loading" ? "Отправка..." : "Отправить анкету"}
        </button>

        {status === "success" && <div className="success-message">{serverMessage}</div>}
        {status === "error" && <div className="error-message">{serverMessage}</div>}
      </form>
    </div>
  );
}