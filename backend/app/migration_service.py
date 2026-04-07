import os
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from . import models, database

def get_sqlite_conn(filename):
    # Try multiple possible locations for the sqlite files
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = [
        os.path.join(base_dir, "data", filename),
        os.path.join(os.path.dirname(database.get_db_path()), filename)
    ]
    for p in paths:
        if os.path.exists(p):
            print(f"[Migration] Found source: {p}")
            return sqlite3.connect(p)
    print(f"[Migration] WARNING: {filename} not found!")
    return None

def migrate_to_pg(pg_engine):
    print("[Migration] Starting migration to PostgreSQL...")
    
    # 1. Connect to Source DBs
    conn_diet = get_sqlite_conn("dietcalc.db")
    conn_medidas = get_sqlite_conn("medidas_caseiras.db")
    
    if not conn_diet:
        print("[Migration] Source dietcalc.db missing. Skipping migration.")
        return

    PGSession = sessionmaker(bind=pg_engine)
    pg_session = PGSession()

    try:
        # Check if already migrated (e.g. check food count)
        food_count = pg_session.query(models.Food).count()
        if food_count > 0:
            print(f"[Migration] Destination already has {food_count} foods. Skipping.")
            return

        # Initialize tables in PG
        models.Base.metadata.create_all(bind=pg_engine)

        # 2. Migrate Categories
        print("[Migration] Migrating Categories...")
        diet_cursor = conn_diet.cursor()
        categories = diet_cursor.execute("SELECT id, name FROM categories").fetchall()
        for c_id, c_name in categories:
            pg_session.merge(models.Category(id=c_id, name=c_name))
        pg_session.commit()

        # 3. Migrate Foods
        print("[Migration] Migrating Foods...")
        foods = diet_cursor.execute("SELECT * FROM foods").fetchall()
        # Get column names to map correctly
        cols = [description[0] for description in diet_cursor.description]
        for f in foods:
            data = dict(zip(cols, f))
            pg_session.merge(models.Food(**data))
        pg_session.commit()

        # 4. Migrate Patients & Profiles
        print("[Migration] Migrating Patients & Profiles...")
        patients = diet_cursor.execute("SELECT * FROM patients").fetchall()
        cols = [description[0] for description in diet_cursor.description]
        for p in patients:
            data = dict(zip(cols, p))
            pg_session.merge(models.Patient(**data))
        
        profiles = diet_cursor.execute("SELECT * FROM user_profiles").fetchall()
        cols = [description[0] for description in diet_cursor.description]
        for p in profiles:
            data = dict(zip(cols, p))
            pg_session.merge(models.UserProfile(**data))
        pg_session.commit()

        # 5. Migrate Meals & Items
        print("[Migration] Migrating Meals & Items...")
        meals = diet_cursor.execute("SELECT * FROM meals").fetchall()
        cols = [description[0] for description in diet_cursor.description]
        for m in meals:
            data = dict(zip(cols, m))
            pg_session.merge(models.Meal(**data))
            
        items = diet_cursor.execute("SELECT * FROM meal_items").fetchall()
        cols = [description[0] for description in diet_cursor.description]
        for i in items:
            data = dict(zip(cols, i))
            pg_session.merge(models.MealItem(**data))
        pg_session.commit()

        # 6. Migrate Household Measures (from dietcalc.db)
        print("[Migration] Migrating existing measures from dietcalc.db...")
        measures_diet = diet_cursor.execute("SELECT * FROM household_measures").fetchall()
        cols = [description[0] for description in diet_cursor.description]
        for m in measures_diet:
            data = dict(zip(cols, m))
            pg_session.merge(models.HouseholdMeasure(**data))
        pg_session.commit()

        # 7. Migrate measures from medidas_caseiras.db (Link by name)
        if conn_medidas:
            print("[Migration] Integrating measures from medidas_caseiras.db...")
            med_cursor = conn_medidas.cursor()
            # Schema: id, categoria, alimento, medida_caseira, quantidade, unidade
            # Note: We match 'alimento' to Food.name
            extra_medidas = med_cursor.execute("SELECT alimento, medida_caseira, quantidade FROM medidas").fetchall()
            
            # Create a lookup for food names to IDs to be faster
            food_lookup = {f.name.lower(): f.id for f in pg_session.query(models.Food.id, models.Food.name).all()}
            
            added_count = 0
            for name, unit, qty in extra_medidas:
                f_id = food_lookup.get(name.lower())
                if f_id:
                    # Check if this exact measure already exists for this food (avoid dupes)
                    existing = pg_session.query(models.HouseholdMeasure).filter_by(
                        food_id=f_id, unit_name=unit, quantity_g=qty
                    ).first()
                    
                    if not existing:
                        pg_session.add(models.HouseholdMeasure(
                            food_id=f_id,
                            unit_name=unit,
                            quantity_g=qty
                        ))
                        added_count += 1
            pg_session.commit()
            print(f"[Migration] Added {added_count} supplementary measures.")

        print("[Migration] Success!")

    except Exception as e:
        print(f"[Migration] ERROR: {e}")
        pg_session.rollback()
    finally:
        pg_session.close()
        conn_diet.close()
        if conn_medidas:
            conn_medidas.close()
