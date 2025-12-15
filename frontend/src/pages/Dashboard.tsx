import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getProfile, getMeals } from '../services/api';
import { UserProfile, Meal } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, Utensils, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

 

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState<'A4' | 'Letter'>('A4');
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartImg, setChartImg] = useState<string | null>(null);
  const [pdfChartError, setPdfChartError] = useState<string | null>(null);

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
  ]), [profile?.goal_protein_g, profile?.goal_carbs_g, profile?.goal_fat_g, totals.protein, totals.carbs, totals.fat]);

  useEffect(() => {
    if (!pdfOpen) return;
    setPdfChartError(null);
    setChartImg(null);
    const run = () => {
      try {
        const svgEl = chartRef.current?.querySelector('svg');
        if (!svgEl) {
          setPdfChartError('Gráfico indisponível para exportação');
          return;
        }
        const content = new XMLSerializer().serializeToString(svgEl);
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(content);
        const container = chartRef.current as HTMLDivElement;
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 300;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPdfChartError('Canvas não disponível');
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const pngUrl = canvas.toDataURL('image/png');
            setChartImg(pngUrl);
          } catch {
            setPdfChartError('Falha ao rasterizar gráfico');
          }
        };
        img.onerror = () => setPdfChartError('Falha ao carregar gráfico');
        img.src = svgDataUrl;
      } catch {
        setPdfChartError('Erro ao preparar gráfico');
      }
    };
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [pdfOpen, macroComparisonData]);

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

  const percentKcal = Math.min(100, (totals.kcal / profile.goal_get) * 100);
  const percentProtein = Math.min(100, (totals.protein / profile.goal_protein_g) * 100);
  const percentCarbs = Math.min(100, (totals.carbs / profile.goal_carbs_g) * 100);
  const percentFat = Math.min(100, (totals.fat / profile.goal_fat_g) * 100);

  const exportCSV = async () => {
    try {
      setExportError(null);
      setExportSuccess(null);
      setExporting(true);
      const csvEscape = (v: unknown) => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      const rows: string[] = [];
      rows.push('Secao,Campo,Valor');
      rows.push(['Calculadora','Nome', profile.name].map(csvEscape).join(','));
      rows.push(['Calculadora','Idade', profile.age].map(csvEscape).join(','));
      rows.push(['Calculadora','Peso', profile.weight].map(csvEscape).join(','));
      rows.push(['Calculadora','Altura', profile.height].map(csvEscape).join(','));
      rows.push(['Calculadora','Sexo', profile.sex].map(csvEscape).join(','));
      rows.push(['Calculadora','Atividade', profile.activity_level].map(csvEscape).join(','));
      rows.push(['Calculadora','TMB', profile.goal_tmb].map(csvEscape).join(','));
      rows.push(['Calculadora','GET', profile.goal_get].map(csvEscape).join(','));
      rows.push(['Calculadora','Proteina_meta_g', profile.goal_protein_g].map(csvEscape).join(','));
      rows.push(['Calculadora','Carbo_meta_g', profile.goal_carbs_g].map(csvEscape).join(','));
      rows.push(['Calculadora','Gordura_meta_g', profile.goal_fat_g].map(csvEscape).join(','));
      rows.push('');
      rows.push('Secao,Resumo,Valor');
      rows.push(['Resumo','Total_kcal', Math.round(totals.kcal)].map(csvEscape).join(','));
      rows.push(['Resumo','Total_proteina_g', totals.protein.toFixed(1)].map(csvEscape).join(','));
      rows.push(['Resumo','Total_carbo_g', totals.carbs.toFixed(1)].map(csvEscape).join(','));
      rows.push(['Resumo','Total_gordura_g', totals.fat.toFixed(1)].map(csvEscape).join(','));
      rows.push(['Resumo','Pct_kcal', Math.round(percentKcal)].map(csvEscape).join(','));
      rows.push(['Resumo','Pct_proteina', Math.round(percentProtein)].map(csvEscape).join(','));
      rows.push(['Resumo','Pct_carbo', Math.round(percentCarbs)].map(csvEscape).join(','));
      rows.push(['Resumo','Pct_gordura', Math.round(percentFat)].map(csvEscape).join(','));
      rows.push('');
      rows.push('Secao,Refeicao,Alimento,Quantidade_g,Kcal_item,Proteina_g,Carbo_g,Gordura_g');
      meals.forEach(meal => {
        meal.items.forEach(item => {
          const food = item.food;
          const ratio = item.quantity / 100;
          const kcal = ((food?.energy_kcal || 0) * ratio).toFixed(0);
          const p = ((food?.protein || 0) * ratio).toFixed(1);
          const c = ((food?.carbohydrate || 0) * ratio).toFixed(1);
          const f = ((food?.lipid || 0) * ratio).toFixed(1);
          const row = [
            'Refeicoes',
            meal.name,
            food?.name || `#${item.food_id}`,
            item.quantity,
            kcal,
            p,
            c,
            f
          ].map(csvEscape).join(',');
          rows.push(row);
        });
      });
      const content = rows.join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const fname = `dietcalc_export_${ts.getFullYear()}-${pad(ts.getMonth()+1)}-${pad(ts.getDate())}.csv`;
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess('Exportação concluída');
    } catch {
      setExportError('Falha ao exportar dados');
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    try {
      setPdfError(null);
      setPdfExporting(true);
      const style = document.createElement('style');
      style.id = 'print-page-style';
      style.innerHTML = `@page { size: ${pdfPage}; margin: 12mm } @media print { body.printing * { visibility: hidden !important; } body.printing #pdf-root, body.printing #pdf-root * { visibility: visible !important; } body.printing #pdf-root { position: absolute; left: 0; top: 0; width: 100%; } }`;
      document.head.appendChild(style);
      document.body.classList.add('printing');
      await new Promise((r) => setTimeout(r, 100));
      window.print();
      document.body.classList.remove('printing');
      document.head.removeChild(style);
      setPdfOpen(false);
    } catch {
      setPdfError('Falha ao gerar PDF');
    } finally {
      setPdfExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Acompanhamento diário de metas vs. consumo</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right mr-2">
                <div className="text-sm text-gray-500">Meta Diária</div>
                <div className="text-2xl font-bold text-green-600">{Math.round(profile.goal_get)} kcal</div>
            </div>
            <button
              onClick={exportCSV}
              disabled={exporting}
              className={`inline-flex items-center rounded-md ${exporting ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-500'} px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600`}
            >
              <Download className="mr-2 h-4 w-4" /> {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <button
              onClick={() => setPdfOpen((v) => !v)}
              disabled={pdfExporting}
              className={`inline-flex items-center rounded-md ${pdfExporting ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-500'} px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              <Download className="mr-2 h-4 w-4" /> {pdfExporting ? 'Preparando...' : 'Exportar PDF'}
            </button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{exportError}</div>
      )}
      {exportSuccess && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{exportSuccess}</div>
      )}
      {pdfError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{pdfError}</div>
      )}

      {pdfOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Pré-visualização de PDF</h3>
            <div className="flex items-center gap-3">
              <select
                value={pdfPage}
                onChange={(e) => setPdfPage(e.target.value as 'A4' | 'Letter')}
                className="px-2 py-1 rounded-md border border-gray-300 bg-white text-xs"
              >
                <option value="A4">A4</option>
                <option value="Letter">Carta</option>
              </select>
              <button
                onClick={exportPDF}
                disabled={pdfExporting}
                className={`inline-flex items-center rounded-md ${pdfExporting ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-500'} px-3 py-1.5 text-xs font-semibold text-white shadow-sm`}
              >
                {pdfExporting ? 'Gerando...' : 'Gerar PDF'}
              </button>
            </div>
          </div>
          <div id="pdf-root" className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-gray-900">DietCalc</div>
                <div className="text-gray-500 text-xs">Relatório diário</div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>{new Date().toLocaleDateString()}</div>
                <div>{new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-2 text-sm">Dados da Calculadora</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div className="text-gray-500">Nome</div><div className="text-gray-900">{profile.name}</div>
                  <div className="text-gray-500">Idade</div><div className="text-gray-900">{profile.age}</div>
                  <div className="text-gray-500">Peso</div><div className="text-gray-900">{profile.weight} kg</div>
                  <div className="text-gray-500">Altura</div><div className="text-gray-900">{profile.height} cm</div>
                  <div className="text-gray-500">Sexo</div><div className="text-gray-900">{profile.sex}</div>
                  <div className="text-gray-500">Atividade</div><div className="text-gray-900">{profile.activity_level}</div>
                  <div className="text-gray-500">TMB</div><div className="text-gray-900">{Math.round(profile.goal_tmb)}</div>
                  <div className="text-gray-500">GET</div><div className="text-gray-900">{Math.round(profile.goal_get)}</div>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-2 text-sm">Resumo do Dia</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div className="text-gray-500">Calorias</div><div className="text-gray-900">{Math.round(totals.kcal)} / {Math.round(profile.goal_get)} kcal</div>
                  <div className="text-gray-500">Proteínas</div><div className="text-gray-900">{totals.protein.toFixed(1)} / {profile.goal_protein_g} g</div>
                  <div className="text-gray-500">Carboidratos</div><div className="text-gray-900">{totals.carbs.toFixed(1)} / {profile.goal_carbs_g} g</div>
                  <div className="text-gray-500">Gorduras</div><div className="text-gray-900">{totals.fat.toFixed(1)} / {profile.goal_fat_g} g</div>
                  <div className="text-gray-500">% Calorias</div><div className="text-gray-900">{Math.round(percentKcal)}%</div>
                  <div className="text-gray-500">% Proteínas</div><div className="text-gray-900">{Math.round(percentProtein)}%</div>
                  <div className="text-gray-500">% Carboidratos</div><div className="text-gray-900">{Math.round(percentCarbs)}%</div>
                  <div className="text-gray-500">% Gorduras</div><div className="text-gray-900">{Math.round(percentFat)}%</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-2 text-sm">Comparativo de Macros</div>
                <div className="h-48">
                  <div ref={chartRef} className="block print:hidden h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={macroComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Meta" fill="#94a3b8" name="Meta" />
                        <Bar dataKey="Consumo" fill="#4f46e5" name="Consumo" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {pdfChartError && (
                    <div className="hidden print:block text-xs text-red-600">{pdfChartError}</div>
                  )}
                  {chartImg && (
                    <img src={chartImg} alt="Comparativo de Macros" className="hidden print:block w-full" />
                  )}
                </div>
                <div className="mt-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-1 pr-2 text-left">Macro</th>
                        <th className="py-1 pr-2 text-right">Meta</th>
                        <th className="py-1 pr-2 text-right">Consumo</th>
                        <th className="py-1 pr-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {macroComparisonData.map((row) => {
                        const meta = row.Meta;
                        const consumo = row.Consumo;
                        const pct = Math.min(100, (consumo / meta) * 100);
                        return (
                          <tr key={row.name} className="border-t">
                            <td className="py-1 pr-2 text-gray-900">{row.name}</td>
                            <td className="py-1 pr-2 text-gray-900 text-right">{Math.round(meta)}</td>
                            <td className="py-1 pr-2 text-gray-900 text-right">{consumo.toFixed(1)}</td>
                            <td className="py-1 pr-2 text-gray-900 text-right">{Math.round(pct)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="font-semibold text-gray-900 mb-2 text-sm">Status Nutricional</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Calorias</span>
                    <span className="text-gray-700">{Math.round(percentKcal)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-1.5">
                    <div className="h-1.5 rounded bg-blue-500" style={{ width: `${percentKcal}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Proteínas</span>
                    <span className="text-gray-700">{Math.round(percentProtein)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-1.5">
                    <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${percentProtein}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Carboidratos</span>
                    <span className="text-gray-700">{Math.round(percentCarbs)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-1.5">
                    <div className="h-1.5 rounded bg-emerald-500" style={{ width: `${percentCarbs}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">Gorduras</span>
                    <span className="text-gray-700">{Math.round(percentFat)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-1.5">
                    <div className="h-1.5 rounded bg-amber-500" style={{ width: `${percentFat}%` }}></div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-semibold text-gray-900 mb-2 text-sm">Alertas</div>
                  <div className="space-y-1">
                    {percentKcal > 110 && (
                      <div className="flex items-start p-2 rounded border bg-yellow-50 text-yellow-800 border-yellow-200 text-xs">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span>Você ultrapassou sua meta calórica em mais de 10%.</span>
                      </div>
                    )}
                    {percentKcal < 50 && (
                      <div className="flex items-start p-2 rounded border bg-blue-50 text-blue-800 border-blue-200 text-xs">
                        <div className="w-4 h-4 mr-2 text-blue-500">i</div>
                        <span>Consumo calórico muito baixo. Tente fazer mais refeições.</span>
                      </div>
                    )}
                    {percentProtein < 80 && (
                      <div className="flex items-start p-2 rounded border bg-yellow-50 text-yellow-800 border-yellow-200 text-xs">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span>Atenção às proteínas! Importante para manutenção muscular.</span>
                      </div>
                    )}
                    {percentKcal >= 90 && percentKcal <= 110 && (
                      <div className="flex items-start p-2 rounded border bg-green-50 text-green-800 border-green-200 text-xs">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Parabéns! Você está dentro da faixa ideal de calorias.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className="font-semibold text-gray-900 mb-2 text-sm">Registros de Refeições</div>
              <div className="space-y-3">
                {meals.map((meal) => (
                  <div key={meal.name} className="border rounded-md p-2" style={{ breakInside: 'avoid' }}>
                    <div className="font-semibold text-gray-800 text-xs mb-2">{meal.name}</div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-1 pr-2 text-left">Alimento</th>
                          <th className="py-1 pr-2 text-right">Qtd (g)</th>
                          <th className="py-1 pr-2 text-right">Kcal</th>
                          <th className="py-1 pr-2 text-right">P</th>
                          <th className="py-1 pr-2 text-right">C</th>
                          <th className="py-1 pr-2 text-right">G</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meal.items.map((item) => {
                          const food = item.food;
                          const ratio = item.quantity / 100;
                          const kcal = ((food?.energy_kcal || 0) * ratio).toFixed(0);
                          const p = ((food?.protein || 0) * ratio).toFixed(1);
                          const c = ((food?.carbohydrate || 0) * ratio).toFixed(1);
                          const f = ((food?.lipid || 0) * ratio).toFixed(1);
                          return (
                            <tr key={`${meal.name}-${item.food_id}-${item.quantity}`} className="border-t">
                              <td className="py-1 pr-2 text-gray-900">{food?.name || `#${item.food_id}`}</td>
                              <td className="py-1 pr-2 text-gray-900 text-right">{item.quantity}</td>
                              <td className="py-1 pr-2 text-gray-900 text-right">{kcal}</td>
                              <td className="py-1 pr-2 text-gray-900 text-right">{p}</td>
                              <td className="py-1 pr-2 text-gray-900 text-right">{c}</td>
                              <td className="py-1 pr-2 text-gray-900 text-right">{f}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
            title="Calorias" 
            current={totals.kcal} 
            target={profile.goal_get} 
            unit="kcal" 
            color="blue" 
        />
        <SummaryCard 
            title="Proteínas" 
            current={totals.protein} 
            target={profile.goal_protein_g} 
            unit="g" 
            color="indigo" 
        />
        <SummaryCard 
            title="Carboidratos" 
            current={totals.carbs} 
            target={profile.goal_carbs_g} 
            unit="g" 
            color="emerald" 
        />
        <SummaryCard 
            title="Gorduras" 
            current={totals.fat} 
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

function SummaryCard({ title, current, target, unit, color }: { title: string; current: number; target: number; unit: string; color: string }) {
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

function ProgressBar({ label, percent, color }: { label: string; percent: number; color: string }) {
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
