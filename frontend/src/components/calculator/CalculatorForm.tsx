import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCw, ChevronRight, ClipboardList, Activity, FlaskConical, UserCheck, CheckCircle } from 'lucide-react';
import { Sex } from '../../types';
import { calculatorSchema, CalculatorFormData, activityLabels } from './calculatorSchema';
import { calculateIMC, getIMCClassification, calculateRCQ, getRCQClassification } from '../../utils/nutrition';

interface CalculatorFormProps {
  initialValues: Partial<CalculatorFormData>;
  patientId: number | null;
  loading: boolean;
  onSubmitForm: (data: CalculatorFormData) => void;
  onReset: () => void;
}

export default function CalculatorForm({ initialValues, patientId, loading, onSubmitForm, onReset }: CalculatorFormProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: initialValues
  });

  // Sempre que o paciente mudar, reseta o formulário por completo com os novos valores iniciais
  useEffect(() => {
    reset(initialValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

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

  const weight = watch('weight');
  const height = watch('height');
  const circ_waist = watch('circ_waist');
  const circ_hip = watch('circ_hip');
  const sex = watch('sex');

  const imc = calculateIMC(weight, height);
  const rcq = calculateRCQ(circ_waist, circ_hip);

  const imcResult = getIMCClassification(imc);
  const rcqResult = getRCQClassification(rcq, sex);

  const handleClear = () => {
    reset(initialValues);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {/* Seção 1: Dados Básicos */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600 border-b pb-2">
          <UserCheck className="w-5 h-5" />
          <h2 className="text-lg font-bold">Dados Básicos</h2>
        </div>
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50"
              placeholder="Ex: 30"
              readOnly
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
          </div>

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

          {imc > 0 && (
            <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">IMC calculado: <span className="text-gray-900">{imc.toFixed(2)}</span></span>
              <span className={`text-sm font-bold ${imcResult.color}`}>{imcResult.label}</span>
            </div>
          )}

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
      </div>

      {/* Seção 2: Medidas Antropométricas */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-indigo-600 border-b pb-2">
          <Activity className="w-5 h-5" />
          <h2 className="text-lg font-bold">Medidas Antropométricas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cintura (cm)</label>
            <input type="number" step="0.1" {...register('circ_waist')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Quadril (cm)</label>
            <input type="number" step="0.1" {...register('circ_hip')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Abdome (cm)</label>
            <input type="number" step="0.1" {...register('circ_abdomen')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Braço Direito (cm)</label>
            <input type="number" step="0.1" {...register('circ_right_arm')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Coxa Direita (cm)</label>
            <input type="number" step="0.1" {...register('circ_right_thigh')} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          
          {rcq > 0 && (
            <div className="md:col-span-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">RCQ calculado: <span className="text-gray-900">{rcq.toFixed(2)}</span></span>
              <span className={`text-sm font-bold ${rcqResult.color}`}>{rcqResult.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seção 3: Anamnese Nutricional */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-indigo-600 border-b pb-2">
          <ClipboardList className="w-5 h-5" />
          <h2 className="text-lg font-bold">Anamnese Nutricional</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Comorbidades</label>
            <textarea {...register('comorbidities')} rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Restrições Alimentares / Alergias</label>
            <input type="text" {...register('dietary_restrictions')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Hábito Intestinal</label>
            <input type="text" {...register('intestinal_habit')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Consumo Hídrico</label>
            <input type="text" {...register('water_intake')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Atividade Física e Frequência</label>
            <input type="text" {...register('physical_activity')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Objetivo do Paciente</label>
            <input type="text" {...register('patient_goal')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rotina de Horários</label>
            <textarea {...register('schedule_routine')} rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
        </div>
      </div>

      {/* Seção 4: Exames Laboratoriais */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-indigo-600 border-b pb-2">
          <FlaskConical className="w-5 h-5" />
          <h2 className="text-lg font-bold">Exames Laboratoriais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Triglicerídeos (mg/dL)</label>
            <input type="number" step="0.1" {...register('lab_triglycerides')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Glicemia (mg/dL)</label>
            <input type="number" step="0.1" {...register('lab_glucose')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Colesterol Total (mg/dL)</label>
            <input type="number" step="0.1" {...register('lab_cholesterol')} className="w-full px-4 py-2 rounded-lg border border-gray-300 transition-all" />
          </div>
        </div>
      </div>

      {/* Seção 5: Conduta do Nutricionista */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-indigo-600 border-b pb-2">
          <CheckCircle className="w-5 h-5" />
          <h2 className="text-lg font-bold">Conduta Profissional</h2>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Registro da Conduta</label>
          <textarea {...register('nutritionist_conduct')} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Descreva a conduta adotada para o paciente..." />
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
          onClick={handleClear}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Limpar</span>
        </button>
      </div>
    </form>
  );
}
