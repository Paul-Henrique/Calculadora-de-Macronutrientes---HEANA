import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import api, { createFood, updateFood, deleteFood } from '../services/api';
import { Food, Category } from '../types';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function FoodList() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/foods/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params: { skip: number; limit: number; search?: string; category_id?: number } = { skip: 0, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await api.get('/foods/', { params });
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFoods();
    }, 500);
    return () => clearTimeout(t);
  }, [fetchFoods]);

  const FoodSchema = z.object({
    name: z.string().min(2, 'Informe o nome'),
    description: z.string().min(2, 'Informe a descrição'),
    energy_kcal: z.coerce.number().positive('Informe kcal'),
    protein: z.coerce.number().nonnegative('Informe proteína'),
    carbohydrate: z.coerce.number().nonnegative('Informe carboidrato'),
    lipid: z.coerce.number().nonnegative('Informe gordura'),
    base_qty: z.coerce.number().positive(),
    base_unit: z.string().min(1),
    category_id: z.coerce.number().optional().nullable(),
  });

  const addForm = useForm<z.infer<typeof FoodSchema>>({
    resolver: zodResolver(FoodSchema),
    defaultValues: {
      name: '',
      description: '',
      energy_kcal: 0,
      protein: 0,
      carbohydrate: 0,
      lipid: 0,
      base_qty: 100,
      base_unit: 'g',
      category_id: undefined,
    },
  });

  const editForm = useForm<z.infer<typeof FoodSchema>>({
    resolver: zodResolver(FoodSchema.partial()),
  });

  const openAdd = () => {
    setErrorMsg('');
    setSuccessMsg('');
    addForm.reset();
    setIsAddOpen(true);
  };

  const openEdit = (food: Food) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFoodToEdit(food);
    editForm.reset({
      name: food.name,
      description: food.description || '',
      energy_kcal: food.energy_kcal ?? 0,
      protein: food.protein ?? 0,
      carbohydrate: food.carbohydrate ?? 0,
      lipid: food.lipid ?? 0,
      base_qty: food.base_qty,
      base_unit: food.base_unit,
      category_id: food.category_id ?? undefined,
    });
    setIsEditOpen(true);
  };

  const confirmDelete = (food: Food) => {
    setFoodToDelete(food);
  };

  const handleAddSubmit = addForm.handleSubmit(async (data) => {
    try {
      const created = await createFood({
        name: data.name,
        description: data.description,
        energy_kcal: data.energy_kcal,
        protein: data.protein,
        carbohydrate: data.carbohydrate,
        lipid: data.lipid,
        base_qty: data.base_qty,
        base_unit: data.base_unit,
        category_id: data.category_id ?? undefined,
      });
      setIsAddOpen(false);
      setSuccessMsg(`Alimento "${created.name}" adicionado com sucesso.`);
      await fetchFoods();
    } catch {
      setErrorMsg('Falha ao adicionar alimento.');
    }
  });

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!foodToEdit) return;
    try {
      const payload: Partial<Food> = {};
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') payload[k] = v;
      });
      const updated = await updateFood(foodToEdit.id, payload);
      setIsEditOpen(false);
      setFoodToEdit(null);
      setSuccessMsg(`Alimento "${updated.name}" atualizado com sucesso.`);
      await fetchFoods();
    } catch {
      setErrorMsg('Falha ao atualizar alimento.');
    }
  });

  const handleDelete = async () => {
    if (!foodToDelete) return;
    try {
      await deleteFood(foodToDelete.id);
      setFoodToDelete(null);
      setSuccessMsg('Alimento excluído com sucesso.');
      await fetchFoods();
    } catch {
      setErrorMsg('Falha ao excluir alimento.');
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
        <div className="mt-4 flex md:mt-0">
          <button
            onClick={openAdd}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </button>
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

      {successMsg && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}
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
                        <div className="mt-4 md:mt-0 flex items-center gap-2">
                          <button
                            onClick={() => openEdit(food)}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </button>
                          <button
                            onClick={() => confirmDelete(food)}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </button>
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

      {/* Add Modal */}
      <Transition appear show={isAddOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                  <Dialog.Title className="text-lg font-medium text-gray-900">Adicionar Alimento</Dialog.Title>
                  <form className="mt-4 space-y-4" onSubmit={handleAddSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('name')} />
                        {addForm.formState.errors.name?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('description')} />
                        {addForm.formState.errors.description?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.description.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Kcal</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('energy_kcal')} />
                        {addForm.formState.errors.energy_kcal?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.energy_kcal.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Proteína (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('protein')} />
                        {addForm.formState.errors.protein?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.protein.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Carboidrato (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('carbohydrate')} />
                        {addForm.formState.errors.carbohydrate?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.carbohydrate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gordura (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('lipid')} />
                        {addForm.formState.errors.lipid?.message && (
                          <p className="text-sm text-red-600">{addForm.formState.errors.lipid.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantidade Base</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('base_qty')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unidade Base</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('base_unit')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...addForm.register('category_id')}>
                          <option value="">Selecionar</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
                      <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">Adicionar</button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Modal */}
      <Transition appear show={isEditOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                  <Dialog.Title className="text-lg font-medium text-gray-900">Editar Alimento</Dialog.Title>
                  <form className="mt-4 space-y-4" onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('name')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('description')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Kcal</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('energy_kcal')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Proteína (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('protein')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Carboidrato (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('carbohydrate')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gordura (g)</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('lipid')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantidade Base</label>
                        <input type="number" step="0.01" className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('base_qty')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unidade Base</label>
                        <input className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('base_unit')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select className="mt-1 w-full rounded-md border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600" {...editForm.register('category_id')}>
                          <option value="">Selecionar</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
                      <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">Salvar</button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirm */}
      <Transition appear show={!!foodToDelete} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setFoodToDelete(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                  <Dialog.Title className="text-lg font-medium text-gray-900">Confirmar Exclusão</Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600">Deseja excluir "{foodToDelete?.name}"?</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setFoodToDelete(null)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
                    <button type="button" onClick={handleDelete} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">Excluir</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
