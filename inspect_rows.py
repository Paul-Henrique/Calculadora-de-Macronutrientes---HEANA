import pandas as pd
file_path = r"c:\Users\paulo.santos\Documents\trae_projects\DietCalc\Tabela TACO Alimentos Excel.xlsx"
df = pd.read_excel(file_path, engine='openpyxl', header=None, nrows=20)
print(df.iloc[:, :2])
