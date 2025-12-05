import pandas as pd
import os

file_path = r"c:\Users\paulo.santos\Documents\trae_projects\DietCalc\Tabela TACO Alimentos Excel.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
else:
    try:
        # Read the first few rows to verify content
        df = pd.read_excel(file_path, engine='openpyxl', nrows=5)
        print("Columns:")
        print(df.columns.tolist())
        print("\nFirst 2 rows:")
        print(df.head(2))
    except Exception as e:
        print(f"Error reading Excel: {e}")
