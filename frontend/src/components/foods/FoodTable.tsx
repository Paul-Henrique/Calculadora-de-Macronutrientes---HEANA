import React from 'react';
import { Edit, Trash2, Scale } from 'lucide-react';
import { Food } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface FoodTableProps {
  foods: Food[];
  onEdit: (food: Food) => void;
  onDelete: (food: Food) => void;
  onManageMeasures: (food: Food) => void;
}

export const FoodTable: React.FC<FoodTableProps> = ({ foods, onEdit, onDelete, onManageMeasures }) => {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {foods.map((food) => (
          <li key={food.id}>
            <div className="block hover:bg-gray-50">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="min-w-0 flex-1 px-2 md:grid md:grid-cols-2 md:gap-4">
                    <div>
                      <p className="truncate text-sm font-medium text-green-600">{food.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-500">{food.base_qty}{food.base_unit}</span>
                        {food.household_measures && food.household_measures.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                            <Scale className="h-3 w-3" />
                            {food.household_measures.length} medida{food.household_measures.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                         <div>
                            <span className="font-semibold text-gray-900">{formatNumber(food.energy_kcal, 0)}</span> kcal
                         </div>
                         <div>
                            <span className="font-semibold text-gray-900">{formatNumber(food.protein, 1)}g</span> Ptn
                         </div>
                         <div>
                            <span className="font-semibold text-gray-900">{formatNumber(food.carbohydrate, 1)}g</span> Carb
                         </div>
                         <div>
                            <span className="font-semibold text-gray-900">{formatNumber(food.lipid, 1)}g</span> Gord
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onManageMeasures(food)}
                    className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Medidas Caseiras"
                  >
                    <Scale className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(food)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(food)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {foods.length === 0 && (
         <div className="text-center py-10 text-gray-500">
             Nenhum alimento encontrado.
         </div>
      )}
    </div>
  );
};
