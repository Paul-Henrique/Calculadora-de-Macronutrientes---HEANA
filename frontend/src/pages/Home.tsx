import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Activity, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Controle sua dieta com precisão científica
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Utilize a base de dados oficial TACO para calcular suas necessidades nutricionais, planejar refeições e alcançar seus objetivos de saúde.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/alimentos"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Buscar Alimentos
              </Link>
              <Link to="/calculadora" className="text-sm font-semibold leading-6 text-gray-900">
                Calcular Necessidades <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-green-100 p-4">
                    <Search className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Base TACO Completa</h3>
                <p className="mt-2 text-gray-600">Acesso a centenas de alimentos com informações nutricionais detalhadas e confiáveis.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-4">
                    <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cálculos Precisos</h3>
                <p className="mt-2 text-gray-600">Determine sua Taxa Metabólica Basal e Gasto Energético Total com fórmulas científicas.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-orange-100 p-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Planejamento Alimentar</h3>
                <p className="mt-2 text-gray-600">Crie dietas personalizadas e acompanhe seu progresso dia a dia.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
