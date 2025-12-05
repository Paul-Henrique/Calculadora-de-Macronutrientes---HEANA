import React, { useEffect, useState } from 'react';
import { getProfile, getMeals } from '../services/api';
import { UserProfile, Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, mealsData] = await Promise.all([
          getProfile().catch(() => null), // Profile might not be set
          getMeals()
        ]);
        setProfile(profileData);
        setMeals(mealsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Carregando dashboard...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-100">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil não configurado</h2>
          <p className="text-gray-600 mb-6">
            Você precisa calcular suas necessidades nutricionais para ver o dashboard.
          </p>
          <Link
            to="/calculadora"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Ir para Calculadora
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Totals
  let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  meals.forEach(meal => {
    meal.items.forEach(item => {
      if (item.food) {
        const ratio = item.quantity / 100;
        totalKcal += (item.food.energy_kcal || 0) * ratio;
        totalProtein += (item.food.protein || 0) * ratio;
        totalCarbs += (item.food.carbohydrate || 0) * ratio;
        totalFat += (item.food.lipid || 0) * ratio;
      }
    });
  });

  const percentKcal = Math.min(100, (totalKcal / profile.goal_get) * 100);
  const percentProtein = Math.min(100, (totalProtein / profile.goal_protein_g) * 100);
  const percentCarbs = Math.min(100, (totalCarbs / profile.goal_carbs_g) * 100);
  const percentFat = Math.min(100, (totalFat / profile.goal_fat_g) * 100);

  const macroComparisonData = [
    { name: 'Proteína', Meta: profile.goal_protein_g, Consumo: totalProtein },
    { name: 'Carboidrato', Meta: profile.goal_carbs_g, Consumo: totalCarbs },
    { name: 'Gordura', Meta: profile.goal_fat_g, Consumo: totalFat },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Acompanhamento diário de metas vs. consumo</p>
        </div>
        <div className="text-right">
            <div className="text-sm text-gray-500">Meta Diária</div>
            <div className="text-2xl font-bold text-green-600">{Math.round(profile.goal_get)} kcal</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
            title="Calorias" 
            current={totalKcal} 
            target={profile.goal_get} 
            unit="kcal" 
            color="blue" 
        />
        <SummaryCard 
            title="Proteínas" 
            current={totalProtein} 
            target={profile.goal_protein_g} 
            unit="g" 
            color="indigo" 
        />
        <SummaryCard 
            title="Carboidratos" 
            current={totalCarbs} 
            target={profile.goal_carbs_g} 
            unit="g" 
            color="emerald" 
        />
        <SummaryCard 
            title="Gorduras" 
            current={totalFat} 
            target={profile.goal_fat_g} 
            unit="g" 
            color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Macro Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Comparativo de Macros (g)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={macroComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Meta" fill="#94a3b8" name="Meta Diária" />
                <Bar dataKey="Consumo" fill="#4f46e5" name="Consumido" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Bars / Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status Nutricional</h3>
          
          <ProgressBar label="Calorias" percent={percentKcal} color="bg-blue-500" />
          <ProgressBar label="Proteínas" percent={percentProtein} color="bg-indigo-500" />
          <ProgressBar label="Carboidratos" percent={percentCarbs} color="bg-emerald-500" />
          <ProgressBar label="Gorduras" percent={percentFat} color="bg-amber-500" />

          <div className="pt-6 border-t border-gray-100">
             <h4 className="font-semibold text-gray-900 mb-3">Alertas</h4>
             <div className="space-y-3">
                {percentKcal > 110 && (
                    <Alert message="Você ultrapassou sua meta calórica em mais de 10%." type="warning" />
                )}
                {percentKcal < 50 && (
                    <Alert message="Consumo calórico muito baixo. Tente fazer mais refeições." type="info" />
                )}
                {percentProtein < 80 && (
                    <Alert message="Atenção às proteínas! Importante para manutenção muscular." type="warning" />
                )}
                {percentKcal >= 90 && percentKcal <= 110 && (
                    <Alert message="Parabéns! Você está dentro da faixa ideal de calorias." type="success" />
                )}
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
         <Link to="/refeicoes" className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium">
            <Utensils className="w-5 h-5" />
            <span>Ir para Planejador de Refeições</span>
         </Link>
      </div>
    </div>
  );
}

function SummaryCard({ title, current, target, unit, color }: any) {
    const percent = Math.min(100, (current / target) * 100);
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${color}-500`}>
            <div className="text-sm text-gray-500 mb-1">{title}</div>
            <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-gray-900">{Math.round(current)}</span>
                <span className="text-sm text-gray-400 mb-1">/ {Math.round(target)} {unit}</span>
            </div>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full bg-${color}-500 transition-all duration-500`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    )
}

function ProgressBar({ label, percent, color }: any) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(percent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}

function Alert({ message, type }: { message: string, type: 'warning' | 'success' | 'info' }) {
    const styles = {
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
        success: "bg-green-50 text-green-800 border-green-200",
        info: "bg-blue-50 text-blue-800 border-blue-200"
    };
    const icons = {
        warning: <AlertTriangle className="w-5 h-5 mr-2" />,
        success: <CheckCircle className="w-5 h-5 mr-2" />,
        info: <div className="w-5 h-5 mr-2 text-blue-500">i</div>
    };

    return (
        <div className={`flex items-start p-3 rounded-md border ${styles[type]}`}>
            {icons[type]}
            <span className="text-sm">{message}</span>
        </div>
    )
}
