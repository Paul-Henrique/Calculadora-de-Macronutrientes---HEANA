from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(
    prefix="/foods",
    tags=["foods"]
)

@router.get("/", response_model=List[schemas.Food])
def read_foods(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Food)
    
    if search:
        query = query.filter(models.Food.name.ilike(f"%{search}%"))
    
    if category_id:
        query = query.filter(models.Food.category_id == category_id)
        
    foods = query.offset(skip).limit(limit).all()
    return foods

@router.get("/categories", response_model=List[schemas.CategorySimple])
def read_categories(db: Session = Depends(database.get_db)):
    categories = db.query(models.Category).all()
    return categories

@router.get("/{food_id}", response_model=schemas.Food)
def read_food(food_id: int, db: Session = Depends(database.get_db)):
    food = db.query(models.Food).filter(models.Food.id == food_id).first()
    if food is None:
        raise HTTPException(status_code=404, detail="Food not found")
    return food
