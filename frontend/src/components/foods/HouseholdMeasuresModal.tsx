import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Trash2, XCircle, Scale } from 'lucide-react';
import { Food, HouseholdMeasure, HouseholdMeasureCreate } from '../../types';
import { getHouseholdMeasures, addHouseholdMeasure, deleteHouseholdMeasure } from '../../services/api';
import { formatNumber } from '../../utils/formatters';

interface HouseholdMeasuresModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: Food | null;
}

interface NutritionForMeasure {
  kcal: number;
  protein: number;
  carbohydrate: number;
  lipid: number;
}

function calcNutrition(food: Food, quantityG: number): NutritionForMeasure {
  const ratio = quantityG / (food.base_qty || 100);
  return {
    kcal: (food.energy_kcal || 0) * ratio,
    protein: (food.protein || 0) * ratio,
    carbohydrate: (food.carbohydrate || 0) * ratio,
    lipid: (food.lipid || 0) * ratio,
  };
}

export const HouseholdMeasuresModal: React.FC<HouseholdMeasuresModalProps> = ({
  isOpen,
  onClose,
  food,
}) => {
  const [measures, setMeasures] = useState<HouseholdMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New measure form state
  const [newUnitName, setNewUnitName] = useState('');
  const [newQuantityG, setNewQuantityG] = useState<string>('');

  useEffect(() => {
    if (isOpen && food) {
      setLoading(true);
      setError(null);
      getHouseholdMeasures(food.id)
        .then(setMeasures)
        .catch(() => setError('Erro ao carregar medidas caseiras.'))
        .finally(() => setLoading(false));
    } else {
      setMeasures([]);
      setNewUnitName('');
      setNewQuantityG('');
      setError(null);
    }
  }, [isOpen, food]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!food || !newUnitName.trim() || !newQuantityG) return;
    const qty = parseFloat(newQuantityG);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantidade em gramas deve ser um número positivo.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data: HouseholdMeasureCreate = {
        food_id: food.id,
        unit_name: newUnitName.trim(),
        quantity_g: qty,
      };
      const created = await addHouseholdMeasure(data);
      setMeasures(prev => [...prev, created]);
      setNewUnitName('');
      setNewQuantityG('');
    } catch {
      setError('Erro ao adicionar medida. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (measureId: number) => {
    try {
      await deleteHouseholdMeasure(measureId);
      setMeasures(prev => prev.filter(m => m.id !== measureId));
    } catch {
      setError('Erro ao excluir medida.');
    }
  };

  const previewQty = parseFloat(newQuantityG);
  const preview = food && !isNaN(previewQty) && previewQty > 0
    ? calcNutrition(food, previewQty)
    : null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl text-left align-middle overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-white" />
                      <Dialog.Title className="text-lg font-bold text-white">
                        Medidas Caseiras
                      </Dialog.Title>
                    </div>
                    {food && (
                      <p className="text-green-100 text-sm mt-0.5">{food.name}</p>
                    )}
                  </div>
                  <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Base info */}
                  {food && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 border border-gray-200">
                      <span className="font-semibold text-gray-700">Referência base:</span>{' '}
                      {food.base_qty}{food.base_unit} → {formatNumber(food.energy_kcal, 0)} kcal |{' '}
                      Ptn {formatNumber(food.protein, 1)}g | Carb {formatNumber(food.carbohydrate, 1)}g | Gord {formatNumber(food.lipid, 1)}g
                    </div>
                  )}

                  {/* Add new measure form */}
                  <form onSubmit={handleAdd} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Adicionar Nova Medida
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipiente / Unidade
                        </label>
                        <input
                          type="text"
                          value={newUnitName}
                          onChange={e => setNewUnitName(e.target.value)}
                          placeholder="Ex: 1 colher de sopa, 1 xícara..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade (gramas)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={newQuantityG}
                          onChange={e => setNewQuantityG(e.target.value)}
                          placeholder="Ex: 15"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Live preview */}
                    {preview && food && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                        <p className="text-green-700 font-medium mb-1">Cálculo automático para {newQuantityG}g:</p>
                        <div className="grid grid-cols-4 gap-3 text-xs text-green-800">
                          <div><span className="font-bold">{formatNumber(preview.kcal, 1)}</span> kcal</div>
                          <div><span className="font-bold">{formatNumber(preview.protein, 1)}g</span> prot</div>
                          <div><span className="font-bold">{formatNumber(preview.carbohydrate, 1)}g</span> carb</div>
                          <div><span className="font-bold">{formatNumber(preview.lipid, 1)}g</span> gord</div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={saving || !newUnitName.trim() || !newQuantityG}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      {saving ? 'Adicionando...' : 'Adicionar Medida'}
                    </button>
                  </form>

                  {/* Existing measures list */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Medidas Cadastradas ({measures.length})
                    </h3>
                    {loading ? (
                      <p className="text-sm text-gray-500 text-center py-4">Carregando...</p>
                    ) : measures.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                        Nenhuma medida cadastrada para este alimento.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {measures.map(measure => {
                          const nutr = food ? calcNutrition(food, measure.quantity_g) : null;
                          return (
                            <div
                              key={measure.id}
                              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-semibold text-gray-900 truncate">{measure.unit_name}</span>
                                  <span className="text-xs text-gray-500">({measure.quantity_g}g)</span>
                                </div>
                                {nutr && (
                                  <div className="mt-1 grid grid-cols-4 gap-2 text-xs text-gray-500">
                                    <span><b className="text-gray-700">{formatNumber(nutr.kcal, 1)}</b> kcal</span>
                                    <span><b className="text-gray-700">{formatNumber(nutr.protein, 1)}g</b> prot</span>
                                    <span><b className="text-gray-700">{formatNumber(nutr.carbohydrate, 1)}g</b> carb</span>
                                    <span><b className="text-gray-700">{formatNumber(nutr.lipid, 1)}g</b> gord</span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleDelete(measure.id)}
                                className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                title="Excluir medida"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
