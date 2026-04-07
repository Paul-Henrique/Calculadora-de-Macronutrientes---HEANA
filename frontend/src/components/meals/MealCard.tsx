import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Meal } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface MealCardProps {
  meal: Meal;
  onDelete: () => void;
  onAddFood: () => void;
  onRemoveItem: (id: number) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onDelete, onAddFood, onRemoveItem }) => {
  const kcalTotal = meal.items.reduce((total, item) => {
    if (!item.food) return total;
    return total + (item.food.energy_kcal || 0) * (item.quantity / 100);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{formatNumber(kcalTotal, 0)}</span> kcal
          </div>
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors">
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
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P/C/G</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meal.items.map(item => {
                  if (!item.food) return null;
                  const ratio = item.quantity / 100;
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 truncate max-w-[150px]">{item.food.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-500">{item.quantity}g</div>
                        {item.food.household_measures && item.food.household_measures.length > 0 && (() => {
                          const measures = item.food.household_measures;
                          // Find exact match or clean multiple first
                          for (const measure of measures) {
                            const ratio = item.quantity / measure.quantity_g;
                            if (Math.abs(ratio - Math.round(ratio)) < 0.01 || Math.abs(ratio - Math.round(ratio * 2) / 2) < 0.01) {
                              return (
                                <div className="text-xs text-gray-400 mt-0.5" title="Medida caseira equivalente">
                                  {ratio === 1 ? `1 ${measure.unit_name}` : `${formatNumber(ratio, 1)} ${measure.unit_name}`}
                                </div>
                              );
                            }
                          }
                          // Fallback to closest measure approximation
                          const closestMeasure = measures.reduce((prev, curr) => {
                            return Math.abs(curr.quantity_g - item.quantity) < Math.abs(prev.quantity_g - item.quantity) ? curr : prev;
                          });
                          const ratio = item.quantity / closestMeasure.quantity_g;
                          return (
                            <div className="text-xs text-gray-400 mt-0.5" title="Medida caseira equivalente">
                              ~{formatNumber(ratio, 1)} {closestMeasure.unit_name}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.food.energy_kcal! * ratio, 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                        <span className="text-blue-600 font-medium">{formatNumber(item.food.protein! * ratio, 1)}</span>/
                        <span className="text-green-600 font-medium">{formatNumber(item.food.carbohydrate! * ratio, 1)}</span>/
                        <span className="text-yellow-600 font-medium">{formatNumber(item.food.lipid! * ratio, 1)}</span>
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
};
