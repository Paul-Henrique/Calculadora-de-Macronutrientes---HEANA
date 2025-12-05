from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas import SexEnum, ActivityLevelEnum

client = TestClient(app)

def test_calculate_nutrition_male():
    response = client.post(
        "/nutrition/calculate",
        json={
            "age": 30,
            "weight": 80,
            "height": 180,
            "sex": "M",
            "activity_level": "moderately_active"
        }
    )
    assert response.status_code == 200
    data = response.json()
    
    # Manual calc:
    # TMB = (10*80) + (6.25*180) - (5*30) + 5
    # TMB = 800 + 1125 - 150 + 5 = 1780
    # GET = 1780 * 1.55 = 2759
    
    assert int(data["tmb"]) == 1780
    assert int(data["get"]) == 2759
    assert "macros" in data
    assert data["macros"]["protein"]["min_pct"] == 10

def test_calculate_nutrition_female():
    response = client.post(
        "/nutrition/calculate",
        json={
            "age": 30,
            "weight": 60,
            "height": 165,
            "sex": "F",
            "activity_level": "sedentary"
        }
    )
    assert response.status_code == 200
    data = response.json()
    
    # Manual calc:
    # TMB = (10*60) + (6.25*165) - (5*30) - 161
    # TMB = 600 + 1031.25 - 150 - 161 = 1320.25
    # GET = 1320.25 * 1.2 = 1584.3
    
    assert abs(data["tmb"] - 1320.25) < 1
    assert abs(data["get"] - 1584.3) < 1
