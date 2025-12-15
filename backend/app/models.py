from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    foods = relationship("Food", back_populates="category")

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    description = Column(String, nullable=True)
    
    base_qty = Column(Float, default=100.0) # Usually 100g
    base_unit = Column(String, default="g")

    # Macros
    humidity = Column(Float, nullable=True)
    energy_kcal = Column(Float, nullable=True)
    energy_kj = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    lipid = Column(Float, nullable=True)
    cholesterol = Column(Float, nullable=True)
    carbohydrate = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    ash = Column(Float, nullable=True)
    
    # Micros (Minerals)
    calcium = Column(Float, nullable=True)
    magnesium = Column(Float, nullable=True)
    manganese = Column(Float, nullable=True)
    phosphorus = Column(Float, nullable=True)
    iron = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    potassium = Column(Float, nullable=True)
    copper = Column(Float, nullable=True)
    zinc = Column(Float, nullable=True)
    
    # Micros (Vitamins)
    retinol = Column(Float, nullable=True)
    re = Column(Float, nullable=True)
    rae = Column(Float, nullable=True)
    thiamin = Column(Float, nullable=True)
    riboflavin = Column(Float, nullable=True)
    pyridoxine = Column(Float, nullable=True)
    niacin = Column(Float, nullable=True)
    vitamin_c = Column(Float, nullable=True)

    category = relationship("Category", back_populates="foods")
    household_measures = relationship("HouseholdMeasure", back_populates="food")

class HouseholdMeasure(Base):
    __tablename__ = "household_measures"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"))
    unit_name = Column(String) # e.g. "Fatia", "Colher de sopa"
    quantity_g = Column(Float) # e.g. 25.0
    
    food = relationship("Food", back_populates="household_measures")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # e.g. "Breakfast", "Lunch"
    
    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")

class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"))
    food_id = Column(Integer, ForeignKey("foods.id"))
    quantity = Column(Float) # in grams
    
    meal = relationship("Meal", back_populates="items")
    food = relationship("Food")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    # Assuming single user for now, or id=1
    name = Column(String, default="User")
    age = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    sex = Column(String)
    activity_level = Column(String)
    
    # Goals
    goal_tmb = Column(Float)
    goal_get = Column(Float)
    goal_protein_g = Column(Float)
    goal_carbs_g = Column(Float)
    goal_fat_g = Column(Float)
