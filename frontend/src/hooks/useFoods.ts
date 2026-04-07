import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Food } from '../types';

interface UseFoodsProps {
  searchTerm?: string;
  categoryId?: number | '';
  limit?: number;
  skip?: number;
}

export function useFoods({ searchTerm = '', categoryId = '', limit = 100, skip = 0 }: UseFoodsProps = {}) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { skip, limit };
      if (searchTerm) params.search = searchTerm;
      if (categoryId !== '') params.category_id = categoryId;

      const response = await api.get<Food[]>('/foods/', { params });
      setFoods(response.data);
    } catch (err: unknown) {
      setError('Erro ao carregar alimentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryId, limit, skip]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFoods();
    }, 500);
    return () => clearTimeout(t);
  }, [fetchFoods]);

  return { foods, loading, error, refresh: fetchFoods };
}
