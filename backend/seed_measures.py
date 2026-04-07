import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, engine
from backend.app import models

def seed_measures():
    session = SessionLocal()
    print("Clearing existing household measures to resolve corruption...")
    session.query(models.HouseholdMeasure).delete()
    session.commit()

    print("Seeding household measures...")
    
    # Common measures dictionary
    # Keyword in food name -> list of (Unit Name, Grams)
    common_measures = {
        "Arroz": [("Colher de sopa cheia", 25.0), ("Escumadeira", 100.0), ("Xícara de chá", 150.0)],
        "Feijão": [("Concha média", 86.0), ("Colher de sopa", 18.0)],
        "Feijao": [("Concha média", 86.0), ("Colher de sopa", 18.0)],
        "Pão": [("Fatia", 25.0), ("Unidade", 50.0)],
        "Pao": [("Fatia", 25.0), ("Unidade", 50.0)],
        "Ovo": [("Unidade", 50.0)],
        "Banana": [("Unidade média", 85.0)],
        "Maçã": [("Unidade média", 130.0)],
        "Maca": [("Unidade média", 130.0)],
        "Leite": [("Copo americano", 165.0), ("Xícara de chá", 200.0)],
        "Queijo": [("Fatia", 30.0)],
        "Manteiga": [("Colher de sopa", 10.0), ("Ponta de faca", 5.0)],
        "Azeite": [("Colher de sopa", 13.0), ("Colher de sobremesa", 5.0)],
        "Aveia": [("Colher de sopa", 15.0)],
        "Frango": [("Filé médio", 100.0), ("Pedaço pequeno", 50.0)],
        "Carne": [("Bife médio", 100.0)],
        "Peixe": [("Filé médio", 100.0)],
        "Suco": [("Copo", 200.0)],
        "Bolacha": [("Unidade", 7.0)],
        "Biscoito": [("Unidade", 7.0)],
        "Iogurte": [("Pote", 170.0)],
        "Mel": [("Colher de sopa", 15.0), ("Colher de chá", 5.0)],
        "Açúcar": [("Colher de sopa", 10.0), ("Colher de chá", 3.0)],
        "Acucar": [("Colher de sopa", 10.0), ("Colher de chá", 3.0)],
        "Café": [("Xícara de café", 50.0), ("Xícara de chá", 150.0)],
        "Cafe": [("Xícara de café", 50.0), ("Xícara de chá", 150.0)],
    }
    
    count = 0
    
    # Iterate over all foods and check if they match keywords
    foods = session.query(models.Food).all()
    
    for food in foods:
        matched = False
        for key, measures in common_measures.items():
            # Check if keyword is at least 3 chars to avoid accidental matches like 'L'
            if len(key) >= 3 and key.lower() in food.name.lower():
                for unit, weight in measures:
                    m = models.HouseholdMeasure(
                        food_id=food.id,
                        unit_name=unit,
                        quantity_g=weight
                    )
                    session.add(m)
                    count += 1
                matched = True
                break # Only match first keyword
                
    session.commit()
    print(f"Added {count} household measures successfully.")

if __name__ == "__main__":
    seed_measures()
