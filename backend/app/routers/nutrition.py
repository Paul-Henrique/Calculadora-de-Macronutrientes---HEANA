from fastapi import APIRouter, HTTPException
from .. import schemas

router = APIRouter(
    prefix="/nutrition",
    tags=["nutrition"]
)

@router.post("/calculate", response_model=schemas.NutritionCalculationResponse)
def calculate_nutrition(data: schemas.NutritionCalculationRequest):
    # Mifflin-St Jeor Formula
    # Men: (10 x weight) + (6.25 x height) - (5 x age) + 5
    # Women: (10 x weight) + (6.25 x height) - (5 x age) - 161
    
    tmb = (10 * data.weight) + (6.25 * data.height) - (5 * data.age)
    
    if data.sex == schemas.SexEnum.M:
        tmb += 5
    else:
        tmb -= 161
        
    # Activity Factors
    activity_factors = {
        schemas.ActivityLevelEnum.SEDENTARY: 1.2,
        schemas.ActivityLevelEnum.LIGHTLY_ACTIVE: 1.375,
        schemas.ActivityLevelEnum.MODERATELY_ACTIVE: 1.55,
        schemas.ActivityLevelEnum.VERY_ACTIVE: 1.725,
        schemas.ActivityLevelEnum.EXTRA_ACTIVE: 1.9
    }
    
    factor = activity_factors[data.activity_level]
    get = tmb * factor
    
    # Macro Ranges (Standard)
    # Protein: 10-35% (using 4kcal/g)
    # Carbs: 45-65% (using 4kcal/g)
    # Fats: 20-35% (using 9kcal/g)
    
    def calc_range(kcal_total, pct_min, pct_max, kcal_per_g):
        return schemas.MacroRange(
            min_pct=pct_min,
            max_pct=pct_max,
            min_grams=int((kcal_total * (pct_min/100)) / kcal_per_g),
            max_grams=int((kcal_total * (pct_max/100)) / kcal_per_g)
        )
    
    macros = {
        "protein": calc_range(get, 10, 35, 4),
        "carbohydrate": calc_range(get, 45, 65, 4),
        "lipid": calc_range(get, 20, 35, 9)
    }
    
    explanation = (
        f"Cálculo baseado na fórmula de Mifflin-St Jeor para TMB ({int(tmb)} kcal) "
        f"multiplicado pelo fator de atividade {factor} para obter o Gasto Energético Total ({int(get)} kcal)."
    )
    
    return schemas.NutritionCalculationResponse(
        tmb=round(tmb, 2),
        get=round(get, 2),
        activity_factor=factor,
        macros=macros,
        explanation=explanation
    )
