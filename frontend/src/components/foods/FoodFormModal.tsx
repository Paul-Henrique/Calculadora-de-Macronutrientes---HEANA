import React, { useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Food, Category } from '../../types';

const FoodSchema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  description: z.string().optional(),
  energy_kcal: z.coerce.number().nonnegative('Informe kcal'),
  protein: z.coerce.number().nonnegative('Informe proteína'),
  carbohydrate: z.coerce.number().nonnegative('Informe carboidrato'),
  lipid: z.coerce.number().nonnegative('Informe gordura'),
  base_qty: z.coerce.number().positive('Informe quantidade base'),
  base_unit: z.string().min(1, 'Informe unidade'),
  category_id: z.coerce.number().optional().nullable(),
});

type FoodFormData = z.infer<typeof FoodSchema>;

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FoodFormData) => Promise<void>;
  initialData?: Food | null;
  categories: Category[];
  title: string;
}

export const FoodFormModal: React.FC<FoodFormModalProps> = ({ 
  isOpen, onClose, onSubmit, initialData, categories, title 
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FoodFormData>({
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
      category_id: null,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          energy_kcal: initialData.energy_kcal || 0,
          protein: initialData.protein || 0,
          carbohydrate: initialData.carbohydrate || 0,
          lipid: initialData.lipid || 0,
          base_qty: initialData.base_qty,
          base_unit: initialData.base_unit,
          category_id: initialData.category_id,
        });
      } else {
        reset({
          name: '',
          description: '',
          energy_kcal: 0,
          protein: 0,
          carbohydrate: 0,
          lipid: 0,
          base_qty: 100,
          base_unit: 'g',
          category_id: null,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                <Dialog.Title className="text-lg font-medium text-gray-900">{title}</Dialog.Title>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('name')} />
                      {errors.name?.message && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <input className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('description')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kcal</label>
                      <input type="number" step="0.1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('energy_kcal')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Proteína (g)</label>
                      <input type="number" step="0.1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('protein')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Carboidrato (g)</label>
                      <input type="number" step="0.1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('carbohydrate')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gordura (g)</label>
                      <input type="number" step="0.1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('lipid')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Qtd Base</label>
                        <input type="number" step="1" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('base_qty')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unidade Base</label>
                        <input className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('base_unit')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoria</label>
                      <select className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" {...register('category_id')}>
                        <option value="">Selecionar</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:ring-2 focus:ring-green-500">
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
