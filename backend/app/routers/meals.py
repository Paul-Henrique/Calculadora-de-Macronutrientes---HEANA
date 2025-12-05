from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/meals",
    tags=["meals"]
)

@router.post("/", response_model=schemas.Meal)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(database.get_db)):
    db_meal = models.Meal(name=meal.name)
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    
    for item in meal.items:
        db_item = models.MealItem(
            meal_id=db_meal.id,
            food_id=item.food_id,
            quantity=item.quantity
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.get("/", response_model=List[schemas.Meal])
def read_meals(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    meals = db.query(models.Meal).offset(skip).limit(limit).all()
    return meals

@router.get("/{meal_id}", response_model=schemas.Meal)
def read_meal(meal_id: int, db: Session = Depends(database.get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
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

@router.post("/{meal_id}/items", response_model=schemas.Meal)
def add_item_to_meal(meal_id: int, item: schemas.MealItemCreate, db: Session = Depends(database.get_db)):
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    db_item = models.MealItem(
        meal_id=meal_id,
        food_id=item.food_id,
        quantity=item.quantity
    )
    db.add(db_item)
    db.commit()
    db.refresh(meal)
    return meal

@router.delete("/{meal_id}/items/{item_id}", response_model=schemas.Meal)
def remove_item_from_meal(meal_id: int, item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.MealItem).filter(models.MealItem.id == item_id, models.MealItem.meal_id == meal_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    return meal
