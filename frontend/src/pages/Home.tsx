import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calculator, Utensils, BarChart2, ArrowRight } from 'lucide-react';
import { usePatient } from '../contexts/PatientContext';

export default function Home() {
  const { selectedPatient } = usePatient();

  const cards = [
    { 
      name: 'Pacientes', 
      description: 'Cadastre e gerencie o histórico completo de seus pacientes.', 
      href: '/pacientes', 
      icon: Users, 
      color: 'bg-indigo-500', 
    },
    { 
      name: 'Calculadora', 
      description: 'Calcule TMB, GET e macros com base em medidas e anamnese.', 
      href: '/calculadora', 
      icon: Calculator, 
      color: 'bg-green-500', 
    },
    { 
      name: 'Refeições', 
      description: 'Planeje dietas personalizadas com alimentos da tabela TACO.', 
      href: '/refeicoes', 
      icon: Utensils, 
      color: 'bg-orange-500', 
    },
    { 
      name: 'Dashboard', 
      description: 'Acompanhe a evolução e gere relatórios profissionais em PDF.', 
      href: '/dashboard', 
      icon: BarChart2, 
      color: 'bg-blue-500', 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Bem-vindo ao <span className="text-green-600">DietCalc</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Sistema profissional para nutricionistas: cálculos precisos, anamnese completa e gestão simplificada de pacientes.
        </p>
        
        {selectedPatient && (
          <div className="mt-8 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 font-medium">
            Atendimento ativo: <span className="font-bold ml-2">{selectedPatient.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.name}
            to={card.href}
            className="relative group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`inline-flex p-3 rounded-xl ${card.color} text-white mb-4 shadow-lg shadow-${card.color.split('-')[1]}-100`}>
              <card.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{card.name}</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              {card.description}
            </p>
            <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
              Acessar agora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {!selectedPatient && (
        <div className="mt-16 bg-indigo-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Comece por aqui</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl">
              Para utilizar todas as funcionalidades do sistema, primeiro cadastre ou selecione um paciente na aba de gerenciamento.
            </p>
            <Link 
              to="/pacientes" 
              className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              <Users className="mr-2 h-5 w-5" />
              Gerenciar Pacientes
            </Link>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
      )}
    </div>
  );
}
