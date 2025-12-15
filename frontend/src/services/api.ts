import axios from 'axios';
import { NutritionCalculationRequest, NutritionCalculationResponse, Meal, MealCreate, MealItemCreate, UserProfile, UserProfileCreate, HouseholdMeasure, Food } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const calculateNutrition = async (data: NutritionCalculationRequest): Promise<NutritionCalculationResponse> => {
  const response = await api.post<NutritionCalculationResponse>('/nutrition/calculate', data);
  return response.data;
};

export const getMeals = async (): Promise<Meal[]> => {
  const response = await api.get<Meal[]>('/meals');
  return response.data;
};

export const createMeal = async (data: MealCreate): Promise<Meal> => {
  const response = await api.post<Meal>('/meals', data);
  return response.data;
};

export const deleteMeal = async (id: number): Promise<void> => {
  await api.delete(`/meals/${id}`);
};

export const addMealItem = async (mealId: number, data: MealItemCreate): Promise<Meal> => {
  const response = await api.post<Meal>(`/meals/${mealId}/items`, data);
  return response.data;
};

export const removeMealItem = async (mealId: number, itemId: number): Promise<Meal> => {
  const response = await api.delete<Meal>(`/meals/${mealId}/items/${itemId}`);
  return response.data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/profile');
  return response.data;
};

export const saveProfile = async (data: UserProfileCreate): Promise<UserProfile> => {
  const response = await api.post<UserProfile>('/profile', data);
  return response.data;
};

export const getHouseholdMeasures = async (foodId: number): Promise<HouseholdMeasure[]> => {
  const response = await api.get<HouseholdMeasure[]>(`/measures/${foodId}`);
  return response.data;
};

// Foods CRUD
export const createFood = async (data: Partial<Food> & { name: string; description: string }): Promise<Food> => {
  const response = await api.post<Food>('/foods/', data);
  return response.data;
};

export const updateFood = async (id: number, data: Partial<Food>): Promise<Food> => {
  const response = await api.put<Food>(`/foods/${id}`, data);
  return response.data;
};

export const deleteFood = async (id: number): Promise<void> => {
  await api.delete(`/foods/${id}`);
};

export default api;
