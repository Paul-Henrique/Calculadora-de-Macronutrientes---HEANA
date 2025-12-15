import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { getMeals, createMeal, deleteMeal, addMealItem, removeMealItem } from '../services/api';
import { Meal } from '../types';
import FoodSelector from '../components/FoodSelector';

export default function MealPlanner() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentMealId, setCurrentMealId] = useState<number | null>(null);
  const [newMealName, setNewMealName] = useState('');

  // Daily totals
  const [dailyTotals, setDailyTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    fetchMeals();
  }, []);

  

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const data = await getMeals();
      // Populate food details for each item if backend doesn't fully do it (backend schema suggests it does via ORM, but let's check)
      // Actually, backend MealItem schema has `food: Optional[Food] = None`. 
      // The route `read_meals` uses `db.query(models.Meal).all()`.
      // SQLAlchemy `relationship` lazy loading might be an issue if not configured or joinedload not used.
      // Ideally backend should use `joinedload`.
      // For now, let's assume it works or fix backend if needed.
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTotals = useCallback(() => {
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
    setDailyTotals({ kcal, protein, carbs, fat });
  }, [meals]);

  useEffect(() => {
    calculateDailyTotals();
  }, [calculateDailyTotals]);

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    try {
      const newMeal = await createMeal({ name: newMealName });
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planejador de Refeições</h1>
          <p className="text-gray-600">Monte sua dieta diária e acompanhe os macros.</p>
        </div>
        
        {/* Daily Totals Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-6 text-sm">
           <div>
             <div className="text-gray-500">Calorias</div>
             <div className="font-bold text-lg text-gray-900">{dailyTotals.kcal.toFixed(0)} kcal</div>
           </div>
           <div>
             <div className="text-gray-500">Proteína</div>
             <div className="font-bold text-lg text-blue-600">{dailyTotals.protein.toFixed(1)}g</div>
           </div>
           <div>
             <div className="text-gray-500">Carbo</div>
             <div className="font-bold text-lg text-green-600">{dailyTotals.carbs.toFixed(1)}g</div>
           </div>
           <div>
             <div className="text-gray-500">Gordura</div>
             <div className="font-bold text-lg text-yellow-600">{dailyTotals.fat.toFixed(1)}g</div>
           </div>
        </div>
      </div>

      {/* Create Meal Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleCreateMeal} className="flex gap-4">
          <input
            type="text"
            placeholder="Nome da refeição (ex: Café da Manhã)"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Refeição
          </button>
        </form>
      </div>

      {/* Meal List */}
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

function MealCard({ meal, onDelete, onAddFood, onRemoveItem }: { 
    meal: Meal, 
    onDelete: () => void, 
    onAddFood: () => void,
    onRemoveItem: (id: number) => void
}) {
    // Calculate meal totals
    let kcal = 0;
    meal.items.forEach(item => {
        if (item.food) {
           const ratio = item.quantity / 100;
           kcal += (item.food.energy_kcal || 0) * ratio;
        }
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{kcal.toFixed(0)}</span> kcal
                    </div>
                    <button onClick={onDelete} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            <div className="p-4">
                {meal.items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alimento</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kcal</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Macros (P/C/G)</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {meal.items.map(item => {
                                    if (!item.food) return null;
                                    const ratio = item.quantity / 100;
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.food.name}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}g</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{((item.food.energy_kcal || 0) * ratio).toFixed(0)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                                <span className="text-blue-600">{((item.food.protein || 0) * ratio).toFixed(1)}</span> / 
                                                <span className="text-green-600">{((item.food.carbohydrate || 0) * ratio).toFixed(1)}</span> / 
                                                <span className="text-yellow-600">{((item.food.lipid || 0) * ratio).toFixed(1)}</span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-400 text-sm italic">
                        Nenhum alimento adicionado.
                    </div>
                )}
                
                <div className="mt-4">
                    <button
                        onClick={onAddFood}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Alimento
                    </button>
                </div>
            </div>
        </div>
    );
}
