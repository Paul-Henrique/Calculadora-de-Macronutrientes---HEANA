import pandas as pd
import sys
import os
import numpy as np

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import Food, Category

def clean_value(val):
    if pd.isna(val):
        return None
    if isinstance(val, str):
        val = val.strip()
        if val.lower() in ['tr', 'traços']:
            return 0.0
        if val == '*' or val == '':
            return None
        try:
            return float(val.replace(',', '.'))
        except ValueError:
            return None
    return float(val)

def import_data():
    print("Dropping old tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    file_path = r"c:\Users\paulo.santos\Documents\trae_projects\DietCalc\Tabela TACO Alimentos Excel.xlsx"
    if not os.path.exists(file_path):
        print("File not found!")
        return

    print("Reading Excel...")
    # Read from row 3 onwards (0-indexed, so header=None, skiprows=...)
    # Actually, header=None reads all. We know the structure.
    df = pd.read_excel(file_path, engine='openpyxl', header=None)
    
    session = SessionLocal()
    
    current_category = None
    
    # Column mapping based on index
    # 0: ID, 1: Name, 2: Moisture, 3: Kcal, 4: kJ, 5: Protein, 6: Lipid, 7: Chol, 8: Carb, 9: Fiber, 10: Ash
    # 11: Ca, 12: Mg, 13: Mn, 14: P, 15: Fe, 16: Na, 17: K, 18: Cu, 19: Zn
    # 20: Retinol, 21: RE, 22: RAE, 23: Thiamin, 24: Riboflavin, 25: Pyridoxine, 26: Niacin, 27: VitC
    
    print("Processing rows...")
    count = 0
    
    for index, row in df.iterrows():
        if index < 3: # Skip headers
            continue
            
        col0 = row[0]
        col1 = row[1]
        
        # Check if it's a category row
        # Logic: Col 0 has text (Category Name) AND Col 1 is NaN
        # OR Col 0 is text and doesn't look like an ID number
        
        is_category = False
        if pd.notna(col0) and pd.isna(col1):
            is_category = True
        elif pd.notna(col0) and isinstance(col0, str) and not col0.replace('.', '').isdigit():
             # Some categories might have non-NaN col1? Usually not in TACO.
             # Let's stick to: Col 1 is NaN is the safest bet for Category headers in this file structure
             pass

        if is_category:
            cat_name = str(col0).strip()
            # Ignore header repetitions
            if "Número do" in cat_name or "Medida" in cat_name:
                continue
                
            print(f"Found Category: {cat_name}")
            category = session.query(Category).filter(Category.name == cat_name).first()
            if not category:
                category = Category(name=cat_name)
                session.add(category)
                session.commit()
                session.refresh(category)
            current_category = category
        else:
            # It's a food item
            if pd.isna(col1): # Skip empty rows
                continue
                
            food_name = str(col1).strip()
            
            # Parse values
            vals = []
            for i in range(2, 28):
                vals.append(clean_value(row[i]))
            
            # Ensure we have a category (should have found one by now)
            if not current_category:
                # Fallback or skip?
                # Maybe create a "General" category
                pass

            food = Food(
                name=food_name,
                category_id=current_category.id if current_category else None,
                humidity=vals[0],
                energy_kcal=vals[1],
                energy_kj=vals[2],
                protein=vals[3],
                lipid=vals[4],
                cholesterol=vals[5],
                carbohydrate=vals[6],
                fiber=vals[7],
                ash=vals[8],
                calcium=vals[9],
                magnesium=vals[10],
                manganese=vals[11],
                phosphorus=vals[12],
                iron=vals[13],
                sodium=vals[14],
                potassium=vals[15],
                copper=vals[16],
                zinc=vals[17],
                retinol=vals[18],
                re=vals[19],
                rae=vals[20],
                thiamin=vals[21],
                riboflavin=vals[22],
                pyridoxine=vals[23],
                niacin=vals[24],
                vitamin_c=vals[25]
            )
            session.add(food)
            count += 1
            
    session.commit()
    print(f"Imported {count} foods successfully.")

if __name__ == "__main__":
    import_data()
