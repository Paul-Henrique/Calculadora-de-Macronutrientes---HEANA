import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateNutrition, saveProfile } from '../services/api';
import { ActivityLevel, NutritionCalculationResponse, Sex, NutritionCalculationRequest } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, RefreshCw, ChevronRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
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
});

type FormData = z.infer<typeof schema>;

const activityLabels: Record<ActivityLevel, string> = {
  [ActivityLevel.SEDENTARY]: "Sedentário (Pouco ou nenhum exercício)",
  [ActivityLevel.LIGHTLY_ACTIVE]: "Levemente Ativo (Exercício leve 1-3 dias/semana)",
  [ActivityLevel.MODERATELY_ACTIVE]: "Moderadamente Ativo (Exercício moderado 3-5 dias/semana)",
  [ActivityLevel.VERY_ACTIVE]: "Muito Ativo (Exercício pesado 6-7 dias/semana)",
  [ActivityLevel.EXTRA_ACTIVE]: "Extremamente Ativo (Exercício muito pesado/trabalho físico)"
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Calculator() {
  const navigate = useNavigate();
  const [result, setResult] = useState<NutritionCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<FormData | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientName: "",
      birthDate: "",
      sex: Sex.M,
      activity_level: ActivityLevel.SEDENTARY
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setCurrentData(data);
    try {
      const req: NutritionCalculationRequest = {
        age: data.age,
        weight: data.weight,
        height: data.height,
        sex: data.sex,
        activity_level: data.activity_level,
      };
      const response = await calculateNutrition(req);
      setResult(response);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Erro ao calcular. Verifique a conexão com o servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const birthDateValue = watch('birthDate');
  useEffect(() => {
    if (!birthDateValue) return;
    const parts = birthDateValue.split('/');
    if (parts.length !== 3) {
      setValue('age', 0, { shouldValidate: true });
      return;
    }
    const d = Number(parts[0]);
    const mo = Number(parts[1]);
    const y = Number(parts[2]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      setValue('age', 0, { shouldValidate: true });
      return;
    }
    const now = new Date();
    if (dt > now) {
      setValue('age', 0, { shouldValidate: true });
      return;
    }
    let age = now.getFullYear() - y;
    const hadBirthday = (now.getMonth() > dt.getMonth()) || (now.getMonth() === dt.getMonth() && now.getDate() >= dt.getDate());
    if (!hadBirthday) age -= 1;
    setValue('age', age, { shouldValidate: true });
  }, [birthDateValue, setValue]);

  const handleSaveProfile = async () => {
    if (!result || !currentData) return;
    
    setSaving(true);
    try {
      await saveProfile({
        name: currentData.patientName,
        age: currentData.age,
        weight: currentData.weight,
        height: currentData.height,
        sex: currentData.sex,
        activity_level: currentData.activity_level,
        goal_tmb: result.tmb,
        goal_get: result.get,
        goal_protein_g: result.macros.protein.max_grams, // Saving the max of range as target
        goal_carbs_g: result.macros.carbohydrate.max_grams,
        goal_fat_g: result.macros.lipid.max_grams
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const macroData = result ? [
    { name: 'Proteínas', value: result.macros.protein.min_grams, range: `${result.macros.protein.min_pct}-${result.macros.protein.max_pct}%` },
    { name: 'Carboidratos', value: result.macros.carbohydrate.min_grams, range: `${result.macros.carbohydrate.min_pct}-${result.macros.carbohydrate.max_pct}%` },
    { name: 'Gorduras', value: result.macros.lipid.min_grams, range: `${result.macros.lipid.min_pct}-${result.macros.lipid.max_pct}%` },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Calculadora Nutricional</h1>
        <p className="text-gray-600">Descubra sua Taxa Metabólica Basal e necessidades diárias</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome do Paciente</label>
              <input
                type="text"
                {...register('patientName')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: João Silva"
              />
              {errors.patientName && <p className="text-red-500 text-sm">{errors.patientName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Data de Nascimento (DD/MM/AAAA)</label>
              <input
                type="text"
                {...register('birthDate')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: 25/12/1990"
                inputMode="numeric"
              />
              {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Idade (anos)</label>
              <input
                type="number"
                {...register('age')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: 30"
                readOnly
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={Sex.M}
                    {...register('sex')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Masculino</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={Sex.F}
                    {...register('sex')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Feminino</span>
                </label>
              </div>
              {errors.sex && <p className="text-red-500 text-sm">{errors.sex.message}</p>}
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                {...register('weight')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: 70.5"
              />
              {errors.weight && <p className="text-red-500 text-sm">{errors.weight.message}</p>}
            </div>

            {/* Altura */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
              <input
                type="number"
                {...register('height')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ex: 175"
              />
              {errors.height && <p className="text-red-500 text-sm">{errors.height.message}</p>}
            </div>

            {/* Nível de Atividade */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nível de Atividade Física</label>
              <select
                {...register('activity_level')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
              >
                {Object.entries(activityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.activity_level && <p className="text-red-500 text-sm">{errors.activity_level.message}</p>}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              <span>{loading ? 'Calculando...' : 'Calcular'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Limpar</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div id="results-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card TMB */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-blue-800 font-semibold mb-2">Taxa Metabólica Basal (TMB)</h3>
              <div className="text-4xl font-bold text-blue-900">{Math.round(result.tmb)} <span className="text-lg font-normal text-blue-700">kcal/dia</span></div>
              <p className="text-blue-600 text-sm mt-2">Energia gasta em repouso absoluto.</p>
            </div>

            {/* Card GET */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-green-800 font-semibold mb-2">Gasto Energético Total (GET)</h3>
              <div className="text-4xl font-bold text-green-900">{Math.round(result.get)} <span className="text-lg font-normal text-green-700">kcal/dia</span></div>
              <p className="text-green-600 text-sm mt-2">Energia necessária para manter o peso atual.</p>
            </div>
          </div>

          {/* Distribuição de Macros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Distribuição Recomendada de Macronutrientes</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-blue-900">Proteínas</span>
                    <span className="text-sm text-blue-700">{result.macros.protein.min_pct}-{result.macros.protein.max_pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800 mt-1">
                    {result.macros.protein.min_grams}-{result.macros.protein.max_grams}g
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-green-900">Carboidratos</span>
                    <span className="text-sm text-green-700">{result.macros.carbohydrate.min_pct}-{result.macros.carbohydrate.max_pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    {result.macros.carbohydrate.min_grams}-{result.macros.carbohydrate.max_grams}g
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-yellow-900">Gorduras</span>
                    <span className="text-sm text-yellow-700">{result.macros.lipid.min_pct}-{result.macros.lipid.max_pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-800 mt-1">
                    {result.macros.lipid.min_grams}-{result.macros.lipid.max_grams}g
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-900 mb-2">Entenda o cálculo:</p>
              <p>{result.explanation}</p>
            </div>
            
            {/* Botão Salvar Perfil */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
               <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
               >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Salvar como Minha Meta</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
