from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

@router.get("/{patient_id}", response_model=schemas.UserProfile)
def get_profile(patient_id: int, db: Session = Depends(database.get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.patient_id == patient_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado para este paciente")
    return profile

@router.post("/", response_model=schemas.UserProfile)
def create_or_update_profile(profile_data: schemas.UserProfileCreate, db: Session = Depends(database.get_db)):
    print(f"[DEBUG] Receiving profile update for patient {profile_data.patient_id}")
    try:
        if not profile_data.patient_id:
            raise HTTPException(status_code=400, detail="ID do paciente é obrigatório")
            
        profile = db.query(models.UserProfile).filter(models.UserProfile.patient_id == profile_data.patient_id).first()
        if not profile:
            profile = models.UserProfile(**profile_data.model_dump())
            db.add(profile)
        else:
            for key, value in profile_data.model_dump().items():
                setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Failed to save profile: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno ao salvar perfil: {str(e)}")
