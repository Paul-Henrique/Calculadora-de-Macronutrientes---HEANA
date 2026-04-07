export interface Patient {
    id: number;
    name: string;
    cpf?: string;
    birth_date?: string;
    sex?: string;
}

export interface PatientCreate {
    name: string;
    cpf?: string;
    birth_date?: string;
    sex?: string;
}

export interface PatientUpdate {
    name?: string;
    cpf?: string;
    birth_date?: string;
    sex?: string;
}

export interface Food {
    id: number;
    name: string;
    description?: string;
    category_id?: number;
    base_qty: number;
    base_unit: string;
    energy_kcal?: number;
    protein?: number;
    carbohydrate?: number;
    lipid?: number;
    household_measures?: HouseholdMeasure[];
}

export interface Category {
    id: number;
    name: string;
}

export interface CategorySimple {
    id: number;
    name: string;
}

export enum Sex {
    M = "M",
    F = "F"
}

export enum ActivityLevel {
    SEDENTARY = "sedentary",
    LIGHTLY_ACTIVE = "lightly_active",
    MODERATELY_ACTIVE = "moderately_active",
    VERY_ACTIVE = "very_active",
    EXTRA_ACTIVE = "extra_active"
}

export interface NutritionCalculationRequest {
    age: number;
    weight: number;
    height: number;
    sex: Sex;
    activity_level: ActivityLevel;
}

export interface MacroRange {
    min_grams: number;
    max_grams: number;
    min_pct: number;
    max_pct: number;
}

export interface NutritionCalculationResponse {
    tmb: number;
    get: number;
    activity_factor: number;
    macros: {
        protein: MacroRange;
        carbohydrate: MacroRange;
        lipid: MacroRange;
    };
    explanation: string;
}

// Meal Types

export interface MealItem {
    id: number;
    meal_id: number;
    food_id: number;
    quantity: number;
    food?: Food;
}

export interface MealItemCreate {
    food_id: number;
    quantity: number;
}

export interface Meal {
    id: number;
    patient_id?: number;
    name: string;
    items: MealItem[];
}

export interface MealCreate {
    name: string;
    patient_id?: number;
    items?: MealItemCreate[];
}

export interface UserProfile {
    id?: number;
    patient_id?: number;
    name: string;
    age: number;
    weight: number;
    height: number;
    sex: Sex;
    activity_level: ActivityLevel;
    
    goal_tmb: number;
    goal_get: number;
    goal_protein_g: number;
    goal_carbs_g: number;
    goal_fat_g: number;

    // Medidas Antropométricas
    circ_waist?: number;
    circ_hip?: number;
    circ_abdomen?: number;
    circ_right_arm?: number;
    circ_right_thigh?: number;

    // Anamnese
    comorbidities?: string;
    dietary_restrictions?: string;
    intestinal_habit?: string;
    water_intake?: string;
    physical_activity?: string;
    patient_goal?: string;
    schedule_routine?: string;

    // Exames
    lab_triglycerides?: number;
    lab_glucose?: number;
    lab_cholesterol?: number;

    // Conduta
    nutritionist_conduct?: string;
}

export type UserProfileCreate = Omit<UserProfile, 'id'>;

export interface HouseholdMeasure {
    id: number;
    food_id: number;
    unit_name: string;
    quantity_g: number;
}

export interface HouseholdMeasureCreate {
    food_id: number;
    unit_name: string;
    quantity_g: number;
}
