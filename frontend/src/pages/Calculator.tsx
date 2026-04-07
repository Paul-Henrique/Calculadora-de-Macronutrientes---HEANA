import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { calculateNutrition, saveProfile } from '../services/api';
import { NutritionCalculationRequest, Sex } from '../types';
import { usePatient } from '../contexts/PatientContext';
import { useCalculator } from '../contexts/CalculatorContext';
import { CalculatorFormData } from '../components/calculator/calculatorSchema';
import CalculatorForm from '../components/calculator/CalculatorForm';
import NutritionResults from '../components/calculator/NutritionResults';

export default function Calculator() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { calculatorState, setCalculatorState, resetCalculatorState } = useCalculator();
  
  // State is only valid if it belongs to the currently selected patient
  const isCorrectPatient = selectedPatient && calculatorState.patientId === selectedPatient.id;
  const result = isCorrectPatient ? calculatorState.result : null;
  const currentData = isCorrectPatient ? calculatorState.currentData : null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpa o estado do calculador sempre que o paciente selecionado mudar
  const prevPatientIdRef = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    const prevId = prevPatientIdRef.current;
    const currentId = selectedPatient?.id ?? null;
    // "undefined" significa montagem inicial — não limpar nessa situação
    if (prevId !== undefined && prevId !== currentId) {
      resetCalculatorState();
    }
    prevPatientIdRef.current = currentId;
  }, [selectedPatient, resetCalculatorState]);

  if (!selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-indigo-50 p-12 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Paciente Selecionado</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Para realizar cálculos nutricionais, você precisa primeiro selecionar um paciente na aba de Gerenciamento de Pacientes.
          </p>
          <Link 
            to="/pacientes" 
            className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
          >
            <span>Ir para Pacientes</span>
          </Link>
        </div>
      </div>
    );
  }

  const initialValues: Partial<CalculatorFormData> = (isCorrectPatient && currentData) ? currentData : {
    patientName: selectedPatient.name || "",
    birthDate: selectedPatient.birth_date ? selectedPatient.birth_date.split('-').reverse().join('/') : "",
    sex: selectedPatient.sex as Sex,
  };

  const onSubmitForm = async (data: CalculatorFormData) => {
    setLoading(true);
    setError(null);
    setCalculatorState(selectedPatient.id, { currentData: data });
    try {
      const req: NutritionCalculationRequest = {
        age: data.age,
        weight: data.weight,
        height: data.height,
        sex: data.sex,
        activity_level: data.activity_level,
      };
      const response = await calculateNutrition(req);
      setCalculatorState(selectedPatient.id, { result: response });
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao calcular. Verifique a conexão com o servidor.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!result || !currentData || !selectedPatient) return;
    
    setSaving(true);
    try {
      await saveProfile({
        patient_id: selectedPatient.id,
        name: currentData.patientName,
        age: currentData.age,
        weight: currentData.weight,
        height: currentData.height,
        sex: currentData.sex,
        activity_level: currentData.activity_level,
        goal_tmb: result.tmb,
        goal_get: result.get,
        goal_protein_g: result.macros.protein.max_grams,
        goal_carbs_g: result.macros.carbohydrate.max_grams,
        goal_fat_g: result.macros.lipid.max_grams,
        
        circ_waist: currentData.circ_waist,
        circ_hip: currentData.circ_hip,
        circ_abdomen: currentData.circ_abdomen,
        circ_right_arm: currentData.circ_right_arm,
        circ_right_thigh: currentData.circ_right_thigh,
        
        comorbidities: currentData.comorbidities,
        dietary_restrictions: currentData.dietary_restrictions,
        intestinal_habit: currentData.intestinal_habit,
        water_intake: currentData.water_intake,
        physical_activity: currentData.physical_activity,
        patient_goal: currentData.patient_goal,
        schedule_routine: currentData.schedule_routine,
        
        lab_triglycerides: currentData.lab_triglycerides,
        lab_glucose: currentData.lab_glucose,
        lab_cholesterol: currentData.lab_cholesterol,
        
        nutritionist_conduct: currentData.nutritionist_conduct
      });
      navigate('/refeicoes');
    } catch (err: unknown) {
      let errorMessage = "Erro ao salvar perfil. Tente novamente.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = `Erro: ${err.response.data.detail}`;
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetCalculatorState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Calculadora Nutricional</h1>
        <p className="text-gray-600">Descubra sua Taxa Metabólica Basal e necessidades diárias</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <CalculatorForm
          initialValues={initialValues}
          patientId={selectedPatient.id}
          loading={loading}
          onSubmitForm={onSubmitForm}
          onReset={handleReset}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {result && currentData && (
        <NutritionResults
          result={result}
          currentData={currentData}
          saving={saving}
          onSaveProfile={handleSaveProfile}
        />
      )}
    </div>
  );
}
