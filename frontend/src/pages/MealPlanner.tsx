import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Utensils, AlertCircle } from 'lucide-react';
import { getMeals, createMeal, updateMeal, deleteMeal, addMealItem, removeMealItem } from '../services/api';
import { Meal } from '../types';
import FoodSelector from '../components/FoodSelector';
import { usePatient } from '../contexts/PatientContext';
import { Link } from 'react-router-dom';
import { MealCard } from '../components/meals/MealCard';
import { formatNumber } from '../utils/formatters';

export default function MealPlanner() {
  const { selectedPatient } = usePatient();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentMealId, setCurrentMealId] = useState<number | null>(null);
  const [newMealName, setNewMealName] = useState('');

  const fetchMeals = useCallback(async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const data = await getMeals(selectedPatient.id);
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const dailyTotals = useMemo(() => {
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

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim() || !selectedPatient) return;
    try {
      const newMeal = await createMeal({ 
        name: newMealName,
        patient_id: selectedPatient.id 
      });
      setMeals([...meals, newMeal]);
      setNewMealName('');
    } catch (error) {
      console.error('Error creating meal:', error);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta refeição?')) return;
    try {
      await deleteMeal(id);
      setMeals(meals.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const openFoodSelector = (mealId: number) => {
    setCurrentMealId(mealId);
    setIsSelectorOpen(true);
  };

  const handleAddFood = async (foodId: number, quantity: number) => {
    if (currentMealId === null) throw new Error('Nenhuma refeição selecionada');
    try {
      await addMealItem(currentMealId, { food_id: foodId, quantity });
      await fetchMeals(); 
    } catch (error) {
      console.error('Error adding food:', error);
      throw error;
    }
  };

  const handleRemoveItem = async (mealId: number, itemId: number) => {
    try {
        await removeMealItem(mealId, itemId);
        await fetchMeals();
    } catch (error) {
        console.error('Error removing item:', error);
    }
  };

  const handleUpdateObservation = async (mealId: number, observation: string) => {
    try {
      const updatedMeal = await updateMeal(mealId, { observation });
      setMeals(meals.map(m => m.id === mealId ? updatedMeal : m));
    } catch (error) {
      console.error('Error updating meal observation:', error);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-indigo-50 p-12 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Paciente Selecionado</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Para gerenciar refeições, selecione um paciente na aba de Gerenciamento de Pacientes.
          </p>
          <Link to="/pacientes" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg transition-all">
            Ir para Pacientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planejador de Refeições</h1>
          <p className="text-gray-600">Monte sua dieta diária e acompanhe os macros.</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-6 text-sm">
           <div>
             <div className="text-gray-500">Calorias</div>
             <div className="font-bold text-lg text-gray-900">{formatNumber(dailyTotals.kcal, 0)} kcal</div>
           </div>
           <div>
             <div className="text-gray-500">Proteína</div>
             <div className="font-bold text-lg text-blue-600">{formatNumber(dailyTotals.protein, 1)}g</div>
           </div>
           <div>
             <div className="text-gray-500">Carbo</div>
             <div className="font-bold text-lg text-green-600">{formatNumber(dailyTotals.carbs, 1)}g</div>
           </div>
           <div>
             <div className="text-gray-500">Gordura</div>
             <div className="font-bold text-lg text-yellow-600">{formatNumber(dailyTotals.fat, 1)}g</div>
           </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleCreateMeal} className="flex gap-4">
          <input
            type="text"
            placeholder="Nome da refeição (ex: Café da Manhã)"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
          />
          <button type="submit" className="bg-green-600 px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-green-500 shadow-sm flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Criar Refeição
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {loading && meals.length === 0 ? (
             <div className="text-center py-10 text-gray-500">Carregando refeições...</div>
        ) : (
             meals.map(meal => (
               <MealCard 
                 key={meal.id} 
                 meal={meal} 
                 onDelete={() => handleDeleteMeal(meal.id)}
                 onAddFood={() => openFoodSelector(meal.id)}
                 onRemoveItem={(itemId) => handleRemoveItem(meal.id, itemId)}
                 onUpdateObservation={(obs) => handleUpdateObservation(meal.id, obs)}
               />
             ))
        )}
        {!loading && meals.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma refeição criada</h3>
                <p className="mt-1 text-sm text-gray-500">Comece criando uma refeição acima.</p>
            </div>
        )}
      </div>

      <FoodSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddFood}
      />
    </div>
  );
}
