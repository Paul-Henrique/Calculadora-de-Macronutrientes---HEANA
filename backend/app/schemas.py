from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class FoodBase(BaseModel):
    name: str
    description: Optional[str]
    base_qty: float
    base_unit: str
    energy_kcal: Optional[float]
    protein: Optional[float]
    carbohydrate: Optional[float]
    lipid: Optional[float]

class Food(FoodBase):
    id: int
    category_id: Optional[int]

    class Config:
        orm_mode = True

class FoodCreate(BaseModel):
    name: str
    description: str
    energy_kcal: float
    protein: float
    carbohydrate: float
    lipid: float
    base_qty: float = 100.0
    base_unit: str = "g"
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

class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int
    foods: List[Food] = []

    class Config:
        orm_mode = True

class CategorySimple(CategoryBase):
    id: int

    class Config:
        orm_mode = True

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
    age: int = Field(..., gt=0, description="Age in years")
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in cm")
    sex: SexEnum
    activity_level: ActivityLevelEnum

class MacroRange(BaseModel):
    min_grams: int
    max_grams: int
    min_pct: int
    max_pct: int

class NutritionCalculationResponse(BaseModel):
    tmb: float
    get: float
    activity_factor: float
    macros: Dict[str, MacroRange]
    explanation: str

# Meal Schemas

class MealItemBase(BaseModel):
    food_id: int
    quantity: float = Field(..., gt=0, description="Quantity in grams")

class MealItemCreate(MealItemBase):
    pass

class MealItem(MealItemBase):
    id: int
    meal_id: int
    food: Optional[Food] = None

    class Config:
        orm_mode = True

class MealBase(BaseModel):
    name: str

class MealCreate(MealBase):
    items: List[MealItemCreate] = []

class Meal(MealBase):
    id: int
    items: List[MealItem] = []

    class Config:
        orm_mode = True

# User Profile Schemas

class UserProfileBase(BaseModel):
    name: str = "User"
    age: int
    weight: float
    height: float
    sex: SexEnum
    activity_level: ActivityLevelEnum
    
    goal_tmb: float
    goal_get: float
    goal_protein_g: float
    goal_carbs_g: float
    goal_fat_g: float

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int

    class Config:
        orm_mode = True

# Household Measure Schemas

class HouseholdMeasureBase(BaseModel):
    unit_name: str
    quantity_g: float

class HouseholdMeasureCreate(HouseholdMeasureBase):
    food_id: int

class HouseholdMeasure(HouseholdMeasureBase):
    id: int
    food_id: int

    class Config:
        orm_mode = True
