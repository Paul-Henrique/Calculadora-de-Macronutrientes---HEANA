from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from enum import Enum
from datetime import date

# Shared Config
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Patient Schemas
class PatientBase(BaseModel):
    name: str = Field(..., min_length=2)
    cpf: Optional[str] = None
    birth_date: Optional[date] = None
    sex: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    birth_date: Optional[date] = None
    sex: Optional[str] = None

class Patient(PatientBase, BaseSchema):
    id: int

# Category Schemas
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategorySimple(CategoryBase, BaseSchema):
    id: int

# Household Measure Schemas
class HouseholdMeasureBase(BaseModel):
    unit_name: str
    quantity_g: float = Field(..., gt=0)

class HouseholdMeasureCreate(HouseholdMeasureBase):
    food_id: int

class HouseholdMeasure(HouseholdMeasureBase, BaseSchema):
    id: int
    food_id: int

# Food Schemas
class FoodBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    base_qty: float = 100.0
    base_unit: str = "g"
    energy_kcal: Optional[float] = None
    protein: Optional[float] = None
    carbohydrate: Optional[float] = None
    lipid: Optional[float] = None

class FoodCreate(FoodBase):
    category_id: Optional[int] = None

class FoodUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    energy_kcal: Optional[float] = None
    protein: Optional[float] = None
    carbohydrate: Optional[float] = None
    lipid: Optional[float] = None
    base_qty: Optional[float] = None
    base_unit: Optional[str] = None
    category_id: Optional[int] = None

class Food(FoodBase, BaseSchema):
    id: int
    category_id: Optional[int] = None
    household_measures: List[HouseholdMeasure] = []

# Category with Foods (Forward ref)
class Category(CategoryBase, BaseSchema):
    id: int
    foods: List[Food] = []

# Nutrition Calculation Schemas
class SexEnum(str, Enum):
    M = "M"
    F = "F"

class ActivityLevelEnum(str, Enum):
    SEDENTARY = "sedentary"        # 1.2
    LIGHTLY_ACTIVE = "lightly_active" # 1.375
    MODERATELY_ACTIVE = "moderately_active" # 1.55
    VERY_ACTIVE = "very_active"    # 1.725
    EXTRA_ACTIVE = "extra_active"  # 1.9

class NutritionCalculationRequest(BaseModel):
    age: int = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    sex: SexEnum
    activity_level: ActivityLevelEnum

class MacroRange(BaseModel):
    min_grams: float
    max_grams: float
    min_pct: float
    max_pct: float

class NutritionCalculationResponse(BaseModel):
    tmb: float
    get: float
    activity_factor: float
    macros: Dict[str, MacroRange]
    explanation: str

# Meal Schemas
class MealItemBase(BaseModel):
    food_id: int
    quantity: float = Field(..., gt=0)

class MealItemCreate(MealItemBase):
    pass

class MealItem(MealItemBase, BaseSchema):
    id: int
    meal_id: int
    food: Optional[Food] = None

class MealBase(BaseModel):
    name: str = Field(..., min_length=1)
    patient_id: Optional[int] = None

class MealCreate(MealBase):
    items: List[MealItemCreate] = []

class Meal(MealBase, BaseSchema):
    id: int
    items: List[MealItem] = []

# User Profile Schemas
class UserProfileBase(BaseModel):
    name: str = "User"
    patient_id: Optional[int] = None
    age: int = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    sex: SexEnum
    activity_level: ActivityLevelEnum
    
    goal_tmb: float
    goal_get: float
    goal_protein_g: float
    goal_carbs_g: float
    goal_fat_g: float

    # Medidas Antropométricas
    circ_waist: Optional[float] = None
    circ_hip: Optional[float] = None
    circ_abdomen: Optional[float] = None
    circ_right_arm: Optional[float] = None
    circ_right_thigh: Optional[float] = None

    # Anamnese
    comorbidities: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    intestinal_habit: Optional[str] = None
    water_intake: Optional[str] = None
    physical_activity: Optional[str] = None
    patient_goal: Optional[str] = None
    schedule_routine: Optional[str] = None

    # Exames
    lab_triglycerides: Optional[float] = None
    lab_glucose: Optional[float] = None
    lab_cholesterol: Optional[float] = None

    # Conduta
    nutritionist_conduct: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase, BaseSchema):
    id: int
