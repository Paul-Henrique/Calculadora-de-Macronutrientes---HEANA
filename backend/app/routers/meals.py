from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(
    prefix="/meals",
    tags=["meals"]
)

@router.post("/", response_model=schemas.Meal)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(database.get_db)):
    db_meal = models.Meal(name=meal.name, patient_id=meal.patient_id, observation=meal.observation)
    db.add(db_meal)
    db.flush() # Get ID without committing yet
    
    for item in meal.items:
        db_item = models.MealItem(
            meal_id=db_meal.id,
            **item.model_dump()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.get("/", response_model=List[schemas.Meal])
def read_meals(patient_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    query = db.query(models.Meal).options(
        joinedload(models.Meal.items).joinedload(models.MealItem.food).joinedload(models.Food.household_measures)
    )
    if patient_id:
        query = query.filter(models.Meal.patient_id == patient_id)
    meals = query.offset(skip).limit(limit).all()
    return meals

@router.get("/{meal_id}", response_model=schemas.Meal)
def read_meal(meal_id: int, db: Session = Depends(database.get_db)):
    meal = db.query(models.Meal).options(
        joinedload(models.Meal.items).joinedload(models.MealItem.food).joinedload(models.Food.household_measures)
    ).filter(models.Meal.id == meal_id).first()
    if meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@router.delete("/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(database.get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(meal)
    db.commit()
    return {"ok": True}

@router.put("/{meal_id}", response_model=schemas.Meal)
def update_meal(meal_id: int, meal_update: schemas.MealUpdate, db: Session = Depends(database.get_db)):
    db_meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if db_meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")
    if meal_update.name is not None:
        db_meal.name = meal_update.name
    if meal_update.observation is not None:
        db_meal.observation = meal_update.observation
    db.commit()
    
    # Re-fetch with full relations
    db_meal = db.query(models.Meal).options(
        joinedload(models.Meal.items).joinedload(models.MealItem.food).joinedload(models.Food.household_measures)
    ).filter(models.Meal.id == meal_id).first()
    return db_meal

@router.post("/{meal_id}/items", response_model=schemas.Meal)
def add_item_to_meal(meal_id: int, item: schemas.MealItemCreate, db: Session = Depends(database.get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    db_item = models.MealItem(
        meal_id=meal_id,
        **item.model_dump()
    )
    db.add(db_item)
    db.commit()
    db.refresh(meal)
    # Re-fetch with full relations
    meal = db.query(models.Meal).options(
        joinedload(models.Meal.items).joinedload(models.MealItem.food).joinedload(models.Food.household_measures)
    ).filter(models.Meal.id == meal_id).first()
    return meal

@router.delete("/{meal_id}/items/{item_id}", response_model=schemas.Meal)
def remove_item_from_meal(meal_id: int, item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.MealItem).filter(models.MealItem.id == item_id, models.MealItem.meal_id == meal_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    
    # Return the meal with full relations
    meal = db.query(models.Meal).options(
        joinedload(models.Meal.items).joinedload(models.MealItem.food).joinedload(models.Food.household_measures)
    ).filter(models.Meal.id == meal_id).first()
    return meal
