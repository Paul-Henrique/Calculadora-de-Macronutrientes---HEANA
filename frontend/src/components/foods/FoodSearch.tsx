import React from 'react';
import { Search } from 'lucide-react';

interface FoodSearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: number | '';
  setSelectedCategory: (val: number | '') => void;
  categories: { id: number; name: string }[];
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ 
  searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories 
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-grow">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
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
  );
};
