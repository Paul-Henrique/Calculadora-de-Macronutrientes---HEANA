from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .routers import foods, nutrition, meals, profile, household_measures, patients
from .database import engine, Base, get_db, get_db_path
from . import models, migration_service

app = FastAPI(
    title="DietCalc API",
    description="API para cálculo nutricional baseada na tabela TACO",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    # Only migrate if we have a PG engine (not falling back to SQLite)
    if engine.name == 'postgresql':
        print("[Startup] PostgreSQL detected. Checking for initial migration...")
        Base.metadata.create_all(bind=engine)
        migration_service.migrate_to_pg(engine)
    else:
        print("[Startup] Using SQLite/Fallback mode. Ensuring tables exist...")
        Base.metadata.create_all(bind=engine)

# CORS (Allow all for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(foods.router)
app.include_router(nutrition.router)
app.include_router(meals.router)
app.include_router(profile.router)
app.include_router(household_measures.router)
app.include_router(patients.router)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        food_count = db.query(models.Food).count()
        cat_count = db.query(models.Category).count()
        return {
            "status": "healthy",
            "database": "connected",
            "food_count": food_count,
            "category_count": cat_count,
            "db_path": get_db_path()
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
