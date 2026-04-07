import React, { useState, Fragment } from 'react';
import { Plus } from 'lucide-react';
import { createFood, updateFood, deleteFood } from '../services/api';
import { Food } from '../types';
import { useFoods } from '../hooks/useFoods';
import { useCategories } from '../hooks/useCategories';
import { FoodSearch } from '../components/foods/FoodSearch';
import { FoodTable } from '../components/foods/FoodTable';
import { FoodFormModal } from '../components/foods/FoodFormModal';
import { HouseholdMeasuresModal } from '../components/foods/HouseholdMeasuresModal';
import { Dialog, Transition } from '@headlessui/react';
import { Alert } from '../components/dashboard/Alert';

export default function FoodList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null);
  const [foodForMeasures, setFoodForMeasures] = useState<Food | null>(null);

  const { categories } = useCategories();
  const { foods, loading, refresh } = useFoods({ searchTerm, categoryId: selectedCategory });

  const openAdd = () => {
    setFoodToEdit(null);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEdit = (food: Food) => {
    setFoodToEdit(food);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: Parameters<typeof createFood>[0]) => {
    try {
      if (foodToEdit) {
        await updateFood(foodToEdit.id, data);
        setSuccessMsg(`Alimento "${data.name}" atualizado com sucesso.`);
      } else {
        await createFood(data);
        setSuccessMsg(`Alimento "${data.name}" adicionado com sucesso.`);
      }
      setIsModalOpen(false);
      refresh();
    } catch {
      setErrorMsg('Falha ao salvar alimento.');
    }
  };

  const handleDelete = async () => {
    if (!foodToDelete) return;
    try {
      await deleteFood(foodToDelete.id);
      setFoodToDelete(null);
      setSuccessMsg('Alimento excluído com sucesso.');
      refresh();
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
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>

      <FoodSearch 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
        categories={categories}
      />

      {successMsg && <Alert message={successMsg} type="success" />}
      {errorMsg && <Alert message={errorMsg} type="warning" />}

      {loading ? (
        <div className="text-center py-10">Carregando alimentos...</div>
      ) : (
        <FoodTable foods={foods} onEdit={openEdit} onDelete={setFoodToDelete} onManageMeasures={setFoodForMeasures} />
      )}

      <FoodFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit} 
        initialData={foodToEdit} 
        categories={categories} 
        title={foodToEdit ? 'Editar Alimento' : 'Adicionar Alimento'}
      />

      <HouseholdMeasuresModal
        isOpen={!!foodForMeasures}
        onClose={() => setFoodForMeasures(null)}
        food={foodForMeasures}
      />

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
