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
    name: string;
    items: MealItem[];
}

export interface MealCreate {
    name: string;
    items?: MealItemCreate[];
}

export interface UserProfile {
    id?: number;
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
