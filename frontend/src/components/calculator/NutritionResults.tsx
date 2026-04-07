import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, Save } from 'lucide-react';
import { NutritionCalculationResponse } from '../../types';
import { CalculatorFormData } from './calculatorSchema';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface NutritionResultsProps {
  result: NutritionCalculationResponse;
  currentData: CalculatorFormData;
  saving: boolean;
  onSaveProfile: () => void;
}

export default function NutritionResults({ result, saving, onSaveProfile }: NutritionResultsProps) {
  const macroData = [
    { name: 'Proteínas', value: result.macros.protein.min_grams, range: `${result.macros.protein.min_pct}-${result.macros.protein.max_pct}%` },
    { name: 'Carboidratos', value: result.macros.carbohydrate.min_grams, range: `${result.macros.carbohydrate.min_pct}-${result.macros.carbohydrate.max_pct}%` },
    { name: 'Gorduras', value: result.macros.lipid.min_grams, range: `${result.macros.lipid.min_pct}-${result.macros.lipid.max_pct}%` },
  ];

  return (
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
              onClick={onSaveProfile}
              disabled={saving}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
           >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Salvar como Minha Meta</span>
           </button>
        </div>
      </div>
    </div>
  );
}
