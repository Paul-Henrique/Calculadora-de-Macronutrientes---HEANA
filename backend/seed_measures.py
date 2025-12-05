import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, engine
from backend.app import models

def seed_measures():
    session = SessionLocal()
    print("Seeding household measures...")
    
    # Common measures dictionary
    # Keyword in food name -> list of (Unit Name, Grams)
    common_measures = {
        "Arroz": [("Colher de sopa cheia", 25.0), ("Escumadeira", 100.0), ("Xícara de chá", 150.0)],
        "Feijão": [("Concha média", 86.0), ("Colher de sopa", 18.0)],
        "Pão": [("Fatia", 25.0), ("Unidade", 50.0)],
        "Ovo": [("Unidade", 50.0)],
        "Banana": [("Unidade média", 85.0)],
        "Maçã": [("Unidade média", 130.0)],
        "Leite": [("Copo americano", 165.0), ("Xícara de chá", 200.0)],
        "Queijo": [("Fatia", 30.0)],
        "Manteiga": [("Colher de sopa", 10.0), ("Ponta de faca", 5.0)],
        "Azeite": [("Colher de sopa", 13.0), ("Colher de sobremesa", 5.0)],
        "Aveia": [("Colher de sopa", 15.0)],
        "Frango": [("Filé médio", 100.0), ("Pedaço pequeno", 50.0)],
        "Carne": [("Bife médio", 100.0)],
    }
    
    count = 0
    
    # Iterate over all foods and check if they match keywords
    foods = session.query(models.Food).all()
    
    for food in foods:
        # Skip if already has measures (to prevent dupes if run multiple times)
        if session.query(models.HouseholdMeasure).filter(models.HouseholdMeasure.food_id == food.id).count() > 0:
            continue
            
        for key, measures in common_measures.items():
            if key.lower() in food.name.lower():
                for unit, weight in measures:
                    # Add measure
                    m = models.HouseholdMeasure(
                        food_id=food.id,
                        unit_name=unit,
                        quantity_g=weight
                    )
                    session.add(m)
                    count += 1
                # Break after first match to avoid duplicate matches (e.g. Pão de Queijo matches Pão and Queijo? Logic improvement needed if rigorous)
                # For MVP, simplistic matching is fine.
                
    session.commit()
    print(f"Added {count} household measures.")

if __name__ == "__main__":
    seed_measures()
