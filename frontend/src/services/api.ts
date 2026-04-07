import axios from 'axios';
import { NutritionCalculationRequest, NutritionCalculationResponse, Meal, MealCreate, MealItemCreate, UserProfile, UserProfileCreate, HouseholdMeasure, Food, Patient, PatientCreate, PatientUpdate } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, // 10 seconds timeout
});

// Interceptor para logging detalhado e tratamento de erros global
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry mechanism para falhas de rede ou timeout (máximo 2 tentativas extras)
    if (!config || !config.retryCount) config.retryCount = 0;
    
    if (config.retryCount < 2 && (error.code === 'ECONNABORTED' || !error.response)) {
      config.retryCount += 1;
      console.warn(`[API Retry] Tentativa ${config.retryCount} para ${config.url}`);
      return new Promise(resolve => setTimeout(() => resolve(api(config)), 1000 * config.retryCount));
    }

    console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Patient API
export const getPatients = async (): Promise<Patient[]> => {
  const response = await api.get<Patient[]>('/patients/');
  return response.data;
};

export const getPatient = async (id: number): Promise<Patient> => {
  const response = await api.get<Patient>(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (data: PatientCreate): Promise<Patient> => {
  const response = await api.post<Patient>('/patients/', data);
  return response.data;
};

export const updatePatient = async (id: number, data: PatientUpdate): Promise<Patient> => {
  const response = await api.put<Patient>(`/patients/${id}`, data);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(`/patients/${id}`);
};

export const calculateNutrition = async (data: NutritionCalculationRequest): Promise<NutritionCalculationResponse> => {
  try {
    const response = await api.post<NutritionCalculationResponse>('/nutrition/calculate', data);
    return response.data;
  } catch (error: unknown) {
    let message = "Erro ao calcular. Verifique a conexão com o servidor.";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) message = "Dados inválidos enviados para o cálculo.";
      if (error.code === 'ECONNABORTED') message = "O servidor demorou muito para responder. Tente novamente.";
    }
    throw new Error(message);
  }
};

export const getMeals = async (patientId?: number): Promise<Meal[]> => {
  const response = await api.get<Meal[]>('/meals', { params: { patient_id: patientId } });
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

export const getProfile = async (patientId: number): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/profile/${patientId}`);
  return response.data;
};

export const saveProfile = async (data: UserProfileCreate): Promise<UserProfile> => {
  try {
    const response = await api.post<UserProfile>('/profile/', data);
    return response.data;
  } catch (error: unknown) {
    let message = "Erro ao salvar perfil. Verifique a conexão com o servidor.";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        message = "Dados do perfil em formato inválido.";
        console.error("[API 422] Validation Details:", error.response.data);
      }
    }
    throw new Error(message);
  }
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
