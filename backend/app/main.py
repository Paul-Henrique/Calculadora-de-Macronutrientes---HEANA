from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .routers import foods, nutrition, meals, profile, household_measures, patients
from .database import engine, Base
from . import database, models
from sqlalchemy import text

# Bases for SQLAlchemy

from . import database, models, migration_service

app = FastAPI(
    title="DietCalc API",
    description="API para cálculo nutricional baseada na tabela TACO",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    # Only migrate if we have a PG engine (not falling back to SQLite)
    # Check if DATABASE_URL is set and engine is NOT sqlite
    if "postgresql" in str(database.engine.url):
        print("[Startup] PostgreSQL detected. Checking for initial migration...")
        database.Base.metadata.create_all(bind=database.engine)
        migration_service.migrate_to_pg(database.engine)
    else:
        print("[Startup] Using SQLite/Fallback mode. Ensuring tables exist...")
        database.Base.metadata.create_all(bind=database.engine)

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

@app.get("/")
def read_root():
    return {"message": "Welcome to DietCalc API"}

@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    try:
        from . import models
        food_count = db.query(models.Food).count()
        cat_count = db.query(models.Category).count()
        return {
            "status": "healthy",
            "database": "connected",
            "food_count": food_count,
            "category_count": cat_count,
            "db_path": database.get_db_path()
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

