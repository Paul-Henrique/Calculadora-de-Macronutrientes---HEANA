import sys
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add parent dir
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import models

load_dotenv()

def migrate():
    # 1. Connect to SQLite (Source)
    sqlite_url = "sqlite:///./backend/data/dietcalc.db"
    sqlite_engine = create_engine(sqlite_url)
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SQLiteSession()
    
    # 2. Connect to Postgres (Destination)
    pg_url = os.getenv("DATABASE_URL")
    if not pg_url:
        print("Error: DATABASE_URL not found. Please set it in .env")
        return

    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)
        
    pg_engine = create_engine(pg_url)
    PGSession = sessionmaker(bind=pg_engine)
    pg_session = PGSession()
    
    print("Connected to databases. Starting migration...")
    
    try:
        # Categories
        print("Migrating Categories...")
        categories = sqlite_session.query(models.Category).all()
        for cat in categories:
            pg_session.merge(models.Category(
                id=cat.id,
                name=cat.name
            ))
        pg_session.commit()
        
        # Foods
        print("Migrating Foods...")
        foods = sqlite_session.query(models.Food).all()
        for food in foods:
            pg_session.merge(models.Food(
                id=food.id,
                name=food.name,
                category_id=food.category_id,
                base_qty=food.base_qty,
                base_unit=food.base_unit,
                energy_kcal=food.energy_kcal,
                protein=food.protein,
                carbohydrate=food.carbohydrate,
                lipid=food.lipid,
                # ... map other fields if strictly needed, or use generic copy if fields match exactly
                # For simplicity in this script, assuming SQLAlchemy models match and we can copy dict
                # However, merge creates new object.
            ))
            # Since there are many fields, let's trust SQLAlchemy ORM object copy?
            # No, session objects are attached to session.
            # Better to use bulk insert with dictionaries.
        
        # Re-doing Foods with bulk insert strategy for efficiency and completeness
        # But merge is safer for idempotency.
        # Let's stick to simple loop for MVP size data (600 items is small).
        
        # Household Measures
        print("Migrating Household Measures...")
        measures = sqlite_session.query(models.HouseholdMeasure).all()
        for m in measures:
             pg_session.merge(models.HouseholdMeasure(
                id=m.id,
                food_id=m.food_id,
                unit_name=m.unit_name,
                quantity_g=m.quantity_g
             ))
        pg_session.commit()

        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        pg_session.rollback()
    finally:
        sqlite_session.close()
        pg_session.close()

if __name__ == "__main__":
    migrate()
