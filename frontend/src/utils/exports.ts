import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile, Meal } from '../types';

const activityLevelMap: Record<string, string> = {
  'sedentary': 'Sedentário',
  'lightly_active': 'Levemente Ativo',
  'moderately_active': 'Moderadamente Ativo',
  'very_active': 'Muito Ativo',
  'extra_active': 'Extremamente Ativo'
};

export const exportCSV = (profile: UserProfile, meals: Meal[], totals: { kcal: number; protein: number; carbs: number; fat: number }) => {
  // ... (previous CSV logic remains the same, but I'll make sure it's complete)
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
  rows.push(['Calculadora','Atividade', activityLevelMap[profile.activity_level] || profile.activity_level].map(csvEscape).join(','));
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
  rows.push('');
  rows.push('Secao,Refeicao,Alimento,Quantidade_g,Kcal_item,Proteina_g,Carbo_g,Gordura_g');
  
  meals.forEach(meal => {
    meal.items.forEach(item => {
      const food = item.food;
      const ratio = item.quantity / 100;
      rows.push([
        'Refeicoes',
        meal.name,
        food?.name || `#${item.food_id}`,
        item.quantity,
        ((food?.energy_kcal || 0) * ratio).toFixed(0),
        ((food?.protein || 0) * ratio).toFixed(1),
        ((food?.carbohydrate || 0) * ratio).toFixed(1),
        ((food?.lipid || 0) * ratio).toFixed(1)
      ].map(csvEscape).join(','));
    });
  });

  const content = rows.join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date();
  const fname = `dietcalc_export_${ts.getFullYear()}-${(ts.getMonth()+1).toString().padStart(2, '0')}-${ts.getDate().toString().padStart(2, '0')}.csv`;
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportPDF = (profile: UserProfile, meals: Meal[], totals: { kcal: number; protein: number; carbs: number; fat: number }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const ts = new Date().toLocaleDateString('pt-BR');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('Relatório Dietético', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data de Emissão: ${ts}`, pageWidth - 50, 15);
  doc.line(14, 25, pageWidth - 14, 25);

  // Patient Info
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('1. Informações do Paciente', 14, 35);
  
  const patientInfoBody = [
      ['Nome', profile.name],
      ['Idade', `${profile.age} anos`],
      ['Peso', `${profile.weight} kg`],
      ['Altura', `${profile.height} cm`],
      ['Sexo', profile.sex === 'M' ? 'Masculino' : 'Feminino'],
      ['Nível de Atividade', activityLevelMap[profile.activity_level] || profile.activity_level]
  ];

  if (profile.circ_waist) patientInfoBody.push(['Cintura', `${profile.circ_waist} cm`]);
  if (profile.circ_hip) patientInfoBody.push(['Quadril', `${profile.circ_hip} cm`]);
  if (profile.circ_abdomen) patientInfoBody.push(['Abdômen', `${profile.circ_abdomen} cm`]);
  if (profile.circ_right_arm) patientInfoBody.push(['Braço Direito', `${profile.circ_right_arm} cm`]);
  if (profile.circ_right_thigh) patientInfoBody.push(['Coxa Direita', `${profile.circ_right_thigh} cm`]);

  autoTable(doc, {
    startY: 40,
    head: [['Campo', 'Valor']],
    body: patientInfoBody,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Goals
  doc.text('2. Metas Nutricionais Diárias', 14, doc.lastAutoTable.finalY + 10);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Calorias (GET)', 'Proteína', 'Carboidratos', 'Gorduras']],
    body: [[
      `${Math.round(profile.goal_get)} kcal`,
      `${profile.goal_protein_g}g`,
      `${profile.goal_carbs_g}g`,
      `${profile.goal_fat_g}g`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105] } // Green-600
  });

  // Totals Summary
  doc.text('3. Resumo do Consumo Atual', 14, doc.lastAutoTable.finalY + 10);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Total Calorias', 'Total Proteína', 'Total Carboidratos', 'Total Gorduras']],
    body: [[
      `${Math.round(totals.kcal)} kcal`,
      `${totals.protein.toFixed(1)}g`,
      `${totals.carbs.toFixed(1)}g`,
      `${totals.fat.toFixed(1)}g`
    ]],
    theme: 'grid'
  });

  // Meal Details
  doc.text('4. Detalhamento das Refeições', 14, doc.lastAutoTable.finalY + 10);
  
  const mealRows: unknown[][] = [];
  meals.forEach(meal => {
    mealRows.push([{ content: `Refeição: ${meal.name}`, colSpan: 6, styles: { fillColor: [243, 244, 246], fontStyle: 'bold' } }]);
    
    meal.items.forEach(item => {
      const food = item.food;
      const ratio = item.quantity / 100;

      let measureStr = '-';
      if (food?.household_measures && food.household_measures.length > 0) {
        const measures = food.household_measures;
        let found = false;
        for (const measure of measures) {
          const mRatio = item.quantity / measure.quantity_g;
          if (Math.abs(mRatio - Math.round(mRatio)) < 0.01 || Math.abs(mRatio - Math.round(mRatio * 2) / 2) < 0.01) {
            measureStr = mRatio === 1 ? `1 ${measure.unit_name}` : `${Number(mRatio.toFixed(1))} ${measure.unit_name}`;
            found = true;
            break;
          }
        }
        if (!found) {
          const closestMeasure = measures.reduce((prev, curr) => {
            return Math.abs(curr.quantity_g - item.quantity) < Math.abs(prev.quantity_g - item.quantity) ? curr : prev;
          });
          const mRatio = item.quantity / closestMeasure.quantity_g;
          measureStr = `~${Number(mRatio.toFixed(1))} ${closestMeasure.unit_name}`;
        }
      }

      mealRows.push([
        food?.name || 'Alimento desconhecido',
        measureStr,
        `${item.quantity}g`,
        `${Math.round((food?.energy_kcal || 0) * ratio)} kcal`,
        `${((food?.protein || 0) * ratio).toFixed(1)}g P`,
        `${((food?.carbohydrate || 0) * ratio).toFixed(1)}g C / ${((food?.lipid || 0) * ratio).toFixed(1)}g G`
      ]);
    });
    
    // Add observation row below meal items if it exists
    if (meal.observation && meal.observation.trim()) {
      mealRows.push([{ content: `Observação: ${meal.observation}`, colSpan: 6, styles: { fontStyle: 'italic', textColor: [100, 100, 100], fontSize: 8.5 } }]);
    }
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Alimento', 'Medida Caseira', 'Qtd', 'Kcal', 'Proteína', 'Carbo/Gord']],
    body: mealRows,
    theme: 'striped',
    styles: { fontSize: 9 }
  });

  // Consumo Hídrico
  const waterRecommendation = profile.weight * 35;
  const waterLiters = (waterRecommendation / 1000).toFixed(1);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('5. Consumo Hídrico', 14, doc.lastAutoTable.finalY + 10);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Recomendação Diária (35ml/kg)', 'Consumo Anamnese']],
    body: [[
      `${waterRecommendation} ml (${waterLiters} Litros)`,
      profile.water_intake || 'Não informado'
    ]],
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233] }, // sky-500
    styles: { halign: 'center' }
  });

  doc.save(`relatorio_${profile.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};
