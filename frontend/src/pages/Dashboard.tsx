import React, { useEffect, useState, useMemo } from 'react';
import { getProfile, getMeals } from '../services/api';
import { UserProfile, Meal } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Utensils, Download, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { exportCSV, exportPDF } from '../utils/exports';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { ProgressBar } from '../components/dashboard/ProgressBar';
import { Alert } from '../components/dashboard/Alert';

export default function Dashboard() {

  const { selectedPatient, selectPatient } = usePatient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState<'A4' | 'Letter'>('A4');

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPatient) return;
      try {
        const [profileData, mealsData] = await Promise.all([
          getProfile(selectedPatient.id).catch(() => null),
          getMeals(selectedPatient.id)
        ]);
        setProfile(profileData);
        setMeals(mealsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPatient]);

  const totals = useMemo(() => {
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    meals.forEach(meal => {
      meal.items.forEach(item => {
        if (item.food) {
          const ratio = item.quantity / 100;
          kcal += (item.food.energy_kcal || 0) * ratio;
          protein += (item.food.protein || 0) * ratio;
          carbs += (item.food.carbohydrate || 0) * ratio;
          fat += (item.food.lipid || 0) * ratio;
        }
      });
    });
    return { kcal, protein, carbs, fat };
  }, [meals]);

  const macroComparisonData = useMemo(() => ([
    { name: 'Proteína', Meta: profile?.goal_protein_g ?? 0, Consumo: totals.protein },
    { name: 'Carboidrato', Meta: profile?.goal_carbs_g ?? 0, Consumo: totals.carbs },
    { name: 'Gordura', Meta: profile?.goal_fat_g ?? 0, Consumo: totals.fat },
  ]), [profile, totals]);

  if (!selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-indigo-50 p-12 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Paciente Selecionado</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Para visualizar o dashboard, selecione um paciente na aba de Gerenciamento de Pacientes.
          </p>
          <Link to="/pacientes" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg transition-all">
            Ir para Pacientes
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Carregando dashboard...</div>;

  if (!profile) {
    return (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-100">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil não configurado</h2>
            <p className="text-gray-600 mb-6">Você precisa calcular suas necessidades nutricionais para ver o dashboard.</p>
            <Link to="/calculadora" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
              Ir para Calculadora
            </Link>
          </div>
        </div>
      );
  }

  const percentKcal = Math.min(100, (totals.kcal / profile.goal_get) * 100);
  const percentProtein = Math.min(100, (totals.protein / profile.goal_protein_g) * 100);
  const percentCarbs = Math.min(100, (totals.carbs / profile.goal_carbs_g) * 100);
  const percentFat = Math.min(100, (totals.fat / profile.goal_fat_g) * 100);

  const handleExportCSV = () => {
    try {
        setExporting(true);
        setExportError(null);
        exportCSV(profile, meals, totals);
        setExportSuccess('Relatório exportado com sucesso!');
        setTimeout(() => setExportSuccess(null), 3000);
    } catch {
        setExportError('Erro ao exportar CSV.');
    } finally {
        setExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
        setExporting(true);
        setExportError(null);
        exportPDF(profile, meals, totals);
        setExportSuccess('Relatório PDF gerado com sucesso!');
        setTimeout(() => setExportSuccess(null), 3000);
        setPdfOpen(false);
    } catch {
        setExportError('Erro ao gerar PDF.');
    } finally {
        setExporting(false);
    }
  };

  const handleFinishConsultation = () => {
    if (window.confirm('Deseja finalizar o atendimento? Isso irá limpar o paciente selecionado e reiniciar o programa para um novo atendimento.')) {
        selectPatient(null);
        // Reset calculator state as well if it belongs to the patient being finished
        // (Though clearing localStorage for selectedPatient might be enough, 
        // a full reload is safer for 'starting over')
        window.location.hash = '#/pacientes';
        window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Consumo vs. Metas Diárias</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden sm:block">
                <div className="text-xs text-gray-500">Meta Diária</div>
                <div className="text-xl font-bold text-green-600">{Math.round(profile.goal_get)} kcal</div>
            </div>
            <button onClick={handleExportCSV} disabled={exporting} className="bg-green-600 px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-green-500 shadow-sm inline-flex items-center">
              <Download className="mr-2 h-4 w-4" /> {exporting ? '...' : 'CSV'}
            </button>
            <button onClick={() => setPdfOpen(!pdfOpen)} className="bg-indigo-600 px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-indigo-500 shadow-sm inline-flex items-center">
              <Download className="mr-2 h-4 w-4" /> PDF
            </button>
        </div>
      </div>

      {(exportError || exportSuccess) && (
        <Alert message={exportError || exportSuccess!} type={exportError ? 'warning' : 'success'} />
      )}

      {pdfOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Pré-visualização de PDF</h3>
            <div className="flex items-center gap-3">
              <select value={pdfPage} onChange={(e) => setPdfPage(e.target.value as 'A4' | 'Letter')} className="px-2 py-1 rounded-md border text-xs">
                <option value="A4">A4</option>
                <option value="Letter">Carta</option>
              </select>
              <button onClick={handleExportPDF} className="bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white rounded-md shadow-sm">
                Gerar PDF
              </button>
            </div>
          </div>
          <div id="pdf-root" className="space-y-4">
              {/* PDF Content (Simplified for preview) */}
              <div className="text-sm font-bold border-b pb-2">Relatório Dietético - {profile.name}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>GET Meta: {Math.round(profile.goal_get)} kcal</div>
                  <div>Consumido: {Math.round(totals.kcal)} kcal</div>
              </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Calorias" current={totals.kcal} target={profile.goal_get} unit="kcal" color="blue" />
        <SummaryCard title="Proteínas" current={totals.protein} target={profile.goal_protein_g} unit="g" color="indigo" />
        <SummaryCard title="Carboidratos" current={totals.carbs} target={profile.goal_carbs_g} unit="g" color="emerald" />
        <SummaryCard title="Gorduras" current={totals.fat} target={profile.goal_fat_g} unit="g" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-primary">Consumo de Macros (g)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Meta" fill="#94a3b8" name="Meta" />
                <Bar dataKey="Consumo" fill="#4f46e5" name="Real" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-primary">Status Nutricional</h3>
          <ProgressBar label="Energia" percent={percentKcal} color="bg-blue-500" />
          <ProgressBar label="Proteínas" percent={percentProtein} color="bg-indigo-500" />
          <ProgressBar label="Carboidratos" percent={percentCarbs} color="bg-emerald-500" />
          <ProgressBar label="Gorduras" percent={percentFat} color="bg-amber-500" />
          
          <div className="pt-6 border-t border-gray-100 space-y-3">
            {percentKcal > 110 && <Alert message="Você ultrapassou sua meta calórica em mais de 10%." type="warning" />}
            {percentKcal < 50 && <Alert message="Consumo calórico muito baixo." type="info" />}
            {percentKcal >= 90 && percentKcal <= 110 && <Alert message="Consumo dentro da meta ideal!" type="success" />}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-6 pt-8 border-t border-gray-100">
         <Link to="/refeicoes" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            <Utensils className="w-5 h-5" />
            <span>Voltar para Planejador</span>
         </Link>

         <button 
           onClick={handleFinishConsultation}
           className="w-full max-w-md bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 group"
         >
            <AlertCircle className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span>Finalizar Atendimento e Novo Paciente</span>
         </button>
         
         <p className="text-gray-400 text-sm">
            Certifique-se de exportar o PDF ou CSV antes de finalizar, se necessário.
         </p>
      </div>
    </div>
  );
}
