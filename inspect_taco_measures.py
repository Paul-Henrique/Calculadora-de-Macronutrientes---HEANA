import pandas as pd

file_path = r"c:\Users\paulo.santos\Documents\trae_projects\DietCalc\Tabela TACO Alimentos Excel.xlsx"
df = pd.read_excel(file_path, engine='openpyxl', header=None, nrows=10)

print("--- Rows 0-9 ---")
for i, row in df.iterrows():
    print(f"Row {i}: {row.tolist()}")
