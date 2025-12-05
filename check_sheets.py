import pandas as pd
import os

file_path = r"c:\Users\paulo.santos\Documents\trae_projects\DietCalc\Tabela TACO Alimentos Excel.xlsx"
xl = pd.ExcelFile(file_path, engine='openpyxl')
print(xl.sheet_names)
