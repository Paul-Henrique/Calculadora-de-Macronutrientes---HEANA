from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

@router.get("/", response_model=schemas.UserProfile)
def get_profile(db: Session = Depends(database.get_db)):
    # For MVP, we assume single user with ID 1
    profile = db.query(models.UserProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not set")
    return profile

@router.post("/", response_model=schemas.UserProfile)
def create_or_update_profile(profile_data: schemas.UserProfileCreate, db: Session = Depends(database.get_db)):
    profile = db.query(models.UserProfile).first()
    if not profile:
        profile = models.UserProfile(**profile_data.dict())
        db.add(profile)
    else:
        for key, value in profile_data.dict().items():
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile
