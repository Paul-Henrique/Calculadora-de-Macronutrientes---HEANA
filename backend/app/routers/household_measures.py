from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/measures",
    tags=["measures"]
)

@router.get("/{food_id}", response_model=List[schemas.HouseholdMeasure])
def read_measures(food_id: int, db: Session = Depends(database.get_db)):
    measures = db.query(models.HouseholdMeasure).filter(models.HouseholdMeasure.food_id == food_id).all()
    return measures

@router.post("/", response_model=schemas.HouseholdMeasure)
def create_measure(measure: schemas.HouseholdMeasureCreate, db: Session = Depends(database.get_db)):
    db_measure = models.HouseholdMeasure(**measure.dict())
    db.add(db_measure)
    db.commit()
    db.refresh(db_measure)
    return db_measure

@router.delete("/{measure_id}")
def delete_measure(measure_id: int, db: Session = Depends(database.get_db)):
    measure = db.query(models.HouseholdMeasure).filter(models.HouseholdMeasure.id == measure_id).first()
    if not measure:
        raise HTTPException(status_code=404, detail="Measure not found")
    
    db.delete(measure)
    db.commit()
    return {"ok": True}
