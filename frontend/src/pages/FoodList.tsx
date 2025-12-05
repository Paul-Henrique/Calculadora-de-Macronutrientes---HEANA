import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';
import { Food, Category } from '../types';

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFoods();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/foods/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const params: any = { skip: 0, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await api.get('/foods/', { params });
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Tabela de Alimentos
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            placeholder="Buscar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {foods.map((food) => (
              <li key={food.id}>
                <div className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 flex-1 items-center">
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="truncate text-sm font-medium text-green-600">{food.name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{food.base_qty}{food.base_unit}</span>
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <div className="grid grid-cols-4 gap-4 text-sm text-gray-500">
                             <div>
                                <span className="font-semibold text-gray-900">{food.energy_kcal?.toFixed(0)}</span> kcal
                             </div>
                             <div>
                                <span className="font-semibold text-gray-900">{food.protein?.toFixed(1)}g</span> Ptn
                             </div>
                             <div>
                                <span className="font-semibold text-gray-900">{food.carbohydrate?.toFixed(1)}g</span> Carb
                             </div>
                             <div>
                                <span className="font-semibold text-gray-900">{food.lipid?.toFixed(1)}g</span> Gord
                             </div>
                          </div>
                        </div>
                      </div>
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
      )}
    </div>
  );
}
