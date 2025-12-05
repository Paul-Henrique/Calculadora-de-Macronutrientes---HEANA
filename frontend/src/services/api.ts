import axios from 'axios';
import { NutritionCalculationRequest, NutritionCalculationResponse, Meal, MealCreate, MealItemCreate, UserProfile, UserProfileCreate, HouseholdMeasure } from '../types';

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

export default api;
