from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import foods, nutrition, meals, profile, household_measures, patients
from .database import engine, Base
from sqlalchemy import text

# Create tables (if not exist, though we used import script)
Base.metadata.create_all(bind=engine)

# Lightweight migration: add columns if missing
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE foods ADD COLUMN description TEXT"))
    except Exception:
        pass
    
    # Adicionar colunas faltantes em user_profiles
    columns_to_add = [
        ("patient_id", "INTEGER REFERENCES patients(id)"),
        ("circ_waist", "FLOAT"),
        ("circ_hip", "FLOAT"),
        ("circ_abdomen", "FLOAT"),
        ("circ_right_arm", "FLOAT"),
        ("circ_right_thigh", "FLOAT"),
        ("comorbidities", "TEXT"),
        ("dietary_restrictions", "TEXT"),
        ("intestinal_habit", "TEXT"),
        ("water_intake", "TEXT"),
        ("physical_activity", "TEXT"),
        ("patient_goal", "TEXT"),
        ("schedule_routine", "TEXT"),
        ("lab_triglycerides", "FLOAT"),
        ("lab_glucose", "FLOAT"),
        ("lab_cholesterol", "FLOAT"),
        ("nutritionist_conduct", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            conn.execute(text(f"ALTER TABLE user_profiles ADD COLUMN {col_name} {col_type}"))
        except Exception:
            pass
            
    try:
        conn.execute(text("ALTER TABLE meals ADD COLUMN patient_id INTEGER REFERENCES patients(id)"))
    except Exception:
        pass
    
    conn.commit()

app = FastAPI(
    title="DietCalc API",
    description="API para cálculo nutricional baseada na tabela TACO",
    version="0.1.0"
)

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
