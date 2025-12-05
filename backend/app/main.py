from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import foods, nutrition, meals, profile, household_measures
from .database import engine, Base

# Create tables (if not exist, though we used import script)
Base.metadata.create_all(bind=engine)

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

@app.get("/")
def read_root():
    return {"message": "Welcome to DietCalc API"}
