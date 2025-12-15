import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import api, { getHouseholdMeasures } from '../services/api';
import { Food, Category, HouseholdMeasure } from '../types';

interface FoodSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (foodId: number, quantity: number) => Promise<void>;
}

export default function FoodSelector({ isOpen, onClose, onSelect }: FoodSelectorProps) {
    const [foods, setFoods] = useState<Food[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [listOpen, setListOpen] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    
    // Selection state
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [quantity, setQuantity] = useState<number>(100);
    
    // Measures
    const [measures, setMeasures] = useState<HouseholdMeasure[]>([]);
    const [selectedMeasureId, setSelectedMeasureId] = useState<number | 'g'>('g');
    const [measureQuantity, setMeasureQuantity] = useState<number>(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/foods/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchFoods = useCallback(async () => {
        setLoading(true);
        try {
            const params: { skip: number; limit: number; search?: string; category_id?: number } = { skip: 0, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.category_id = selectedCategory;

            const response = await api.get('/foods/', { params });
            let items: Food[] = response.data;
            if (searchTerm.length >= 2) {
                const term = searchTerm.toLowerCase();
                items = items.slice().sort((a, b) => {
                    const an = (a.name || '').toLowerCase();
                    const bn = (b.name || '').toLowerCase();
                    const aStarts = an.startsWith(term) ? 1 : 0;
                    const bStarts = bn.startsWith(term) ? 1 : 0;
                    if (aStarts !== bStarts) return bStarts - aStarts; // starts-with first
                    const aIncl = an.includes(term) ? 1 : 0;
                    const bIncl = bn.includes(term) ? 1 : 0;
                    if (aIncl !== bIncl) return bIncl - aIncl; // includes next
                    return an.localeCompare(bn);
                });
            }
            setFoods(items);
            setActiveIndex(items.length > 0 ? 0 : -1);
        } catch (error) {
            console.error('Error fetching foods:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            setSearchTerm('');
            setSelectedCategory('');
            setSelectedFood(null);
            setQuantity(100);
            setMeasures([]);
            setSelectedMeasureId('g');
            setMeasureQuantity(1);
            setListOpen(true);
            setActiveIndex(-1);
        }
    }, [isOpen, fetchCategories]);

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            if (searchTerm.length >= 2 || selectedCategory) {
                fetchFoods();
            } else {
                setFoods([]);
                setActiveIndex(-1);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [isOpen, fetchFoods, searchTerm, selectedCategory]);

    // When food is selected, fetch measures
    useEffect(() => {
        if (selectedFood) {
            setActionError(null);
            getHouseholdMeasures(selectedFood.id)
              .then(data => {
                  setMeasures(data);
              })
              .catch(() => {
                  setMeasures([]);
                  setActionError('Falha ao carregar medidas do alimento');
              });
            setQuantity(100);
            setSelectedMeasureId('g');
            setMeasureQuantity(1);
        }
    }, [selectedFood]);

    // Calculate grams when measure changes
    useEffect(() => {
        if (selectedMeasureId === 'g') {
            // Do nothing, quantity is set directly
        } else {
            const measure = measures.find(m => m.id === selectedMeasureId);
            if (measure) {
                setQuantity(measure.quantity_g * measureQuantity);
            }
        }
    }, [selectedMeasureId, measureQuantity, measures]);

    

    const handleConfirm = async () => {
        if (!selectedFood) return;
        setActionError(null);
        const q = Number(quantity);
        if (!Number.isFinite(q) || q <= 0) {
            setActionError('Informe uma quantidade válida (> 0)');
            return;
        }
        try {
            setActionLoading(true);
            await onSelect(selectedFood.id, q);
            onClose();
        } catch {
            setActionError('Falha ao adicionar alimento. Verifique a conexão e tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Adicionar Alimento
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search Filters */}
                <div className="space-y-3 mb-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Buscar (ex: Arroz)"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setListOpen(true); }}
                            onFocus={() => setListOpen(true)}
                            onKeyDown={(e) => {
                                if (!listOpen || foods.length === 0) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setActiveIndex((prev) => Math.min(prev + 1, foods.length - 1));
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (activeIndex >= 0) setSelectedFood(foods[activeIndex]);
                                } else if (e.key === 'Escape') {
                                    setListOpen(false);
                                }
                            }}
                        />
                    </div>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="">Todas as Categorias</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Food List */}
                        {listOpen && (
                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md" role="listbox" aria-label="Sugestões de alimentos">
                            {loading ? (
                                <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {searchTerm.length < 2 && !selectedCategory && (
                                        <div className="p-4 text-center text-sm text-gray-500">Digite ao menos 2 caracteres para ver sugestões.</div>
                                    )}
                                    {foods.map((food, idx) => (
                                        <li 
                                            key={food.id} 
                                            className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedFood?.id === food.id ? 'bg-green-50 ring-1 ring-green-500' : ''} ${idx === activeIndex ? 'bg-gray-100' : ''}`}
                                            onClick={() => setSelectedFood(food)}
                                            role="option"
                                            aria-selected={idx === activeIndex}
                                        >
                                            <div className="text-sm font-medium text-gray-900">{food.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {food.energy_kcal?.toFixed(0)} kcal | {food.protein?.toFixed(1)}g Ptn | {food.carbohydrate?.toFixed(1)}g Carb | {food.lipid?.toFixed(1)}g Gord
                                            </div>
                                        </li>
                                    ))}
                                    {foods.length === 0 && (
                                        <div className="p-4 text-center text-sm text-gray-500">Nenhum alimento encontrado.</div>
                                    )}
                                </ul>
                            )}
                        </div>
                        )}

                        {actionError && (
                            <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                                {actionError}
                            </div>
                        )}

                        {/* Quantity Input */}
                        {selectedFood && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantidade - {selectedFood.name}
                                </label>
                                
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <select 
                                            className="block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                            value={selectedMeasureId}
                                            onChange={(e) => {
                                                const val = e.target.value === 'g' ? 'g' : Number(e.target.value);
                                                setSelectedMeasureId(val);
                                                if (val === 'g') {
                                                    setQuantity(100); // Reset to 100g default
                                                } else {
                                                    setMeasureQuantity(1); // Reset multiplier
                                                }
                                            }}
                                        >
                                            <option value="g">Gramas (g)</option>
                                            {measures.map(m => (
                                                <option key={m.id} value={m.id}>{m.unit_name} (~{m.quantity_g}g)</option>
                                            ))}
                                        </select>

                                        {selectedMeasureId === 'g' ? (
                                            <input
                                                type="number"
                                                min="1"
                                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-1/2 sm:text-sm border-gray-300 rounded-md"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                            />
                                        ) : (
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-1/2 sm:text-sm border-gray-300 rounded-md"
                                                value={measureQuantity}
                                                onChange={(e) => setMeasureQuantity(Number(e.target.value))}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="text-sm text-gray-500 flex justify-between border-t pt-2 mt-2">
                                        <span>
                                            {selectedMeasureId !== 'g' && (
                                                <span className="italic">Total: {quantity.toFixed(1)}g</span>
                                            )}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {((selectedFood.energy_kcal || 0) * quantity / 100).toFixed(0)} kcal
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${actionLoading ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${!selectedFood ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleConfirm}
                            disabled={!selectedFood || actionLoading}
                        >
                            {actionLoading ? 'Adicionando...' : 'Adicionar'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
