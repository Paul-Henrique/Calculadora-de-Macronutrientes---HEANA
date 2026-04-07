import * as z from 'zod';
import { Sex, ActivityLevel } from '../../types';

export const calculatorSchema = z.object({
  patientName: z.string().min(1, "Informe o nome"),
  birthDate: z.string().min(10, "Informe a data no formato DD/MM/AAAA").superRefine((val, ctx) => {
    const m = /^\d{2}\/\d{2}\/\d{4}$/.exec(val);
    if (!m) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato inválido (DD/MM/AAAA)" });
      return;
    }
    const [dStr, mStr, yStr] = val.split('/');
    const d = Number(dStr);
    const mo = Number(mStr);
    const y = Number(yStr);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data inválida" });
      return;
    }
    const now = new Date();
    if (dt > now) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data no futuro" });
    }
  }),
  age: z.coerce.number().min(1, "Idade deve ser maior que 0").max(120, "Idade inválida"),
  weight: z.coerce.number().min(1, "Peso deve ser maior que 0").max(500, "Peso inválido"),
  height: z.coerce.number().min(1, "Altura deve ser maior que 0").max(300, "Altura inválida"),
  sex: z.nativeEnum(Sex, { errorMap: () => ({ message: "Selecione o sexo" }) }),
  activity_level: z.nativeEnum(ActivityLevel, { errorMap: () => ({ message: "Selecione o nível de atividade" }) }),
  
  // Medidas Antropométricas
  circ_waist: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  circ_hip: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  circ_abdomen: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  circ_right_arm: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  circ_right_thigh: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),

  // Anamnese
  comorbidities: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  intestinal_habit: z.string().optional(),
  water_intake: z.string().optional(),
  physical_activity: z.string().optional(),
  patient_goal: z.string().optional(),
  schedule_routine: z.string().optional(),

  // Exames
  lab_triglycerides: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  lab_glucose: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),
  lab_cholesterol: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().optional()),

  // Conduta
  nutritionist_conduct: z.string().optional(),
});

export type CalculatorFormData = z.infer<typeof calculatorSchema>;

export const activityLabels: Record<ActivityLevel, string> = {
  [ActivityLevel.SEDENTARY]: "Sedentário (Pouco ou nenhum exercício)",
  [ActivityLevel.LIGHTLY_ACTIVE]: "Levemente Ativo (Exercício leve 1-3 dias/semana)",
  [ActivityLevel.MODERATELY_ACTIVE]: "Moderadamente Ativo (Exercício moderado 3-5 dias/semana)",
  [ActivityLevel.VERY_ACTIVE]: "Muito Ativo (Exercício pesado 6-7 dias/semana)",
  [ActivityLevel.EXTRA_ACTIVE]: "Extremamente Ativo (Exercício muito pesado/trabalho físico)"
};
