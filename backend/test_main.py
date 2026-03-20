from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to DietCalc API"}

def test_read_foods():
    response = client.get("/foods/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_calculate_nutrition():
    payload = {
        "age": 30,
        "weight": 70,
        "height": 175,
        "sex": "M",
        "activity_level": "sedentary"
    }
    response = client.post("/nutrition/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tmb" in data
    assert "get" in data
    assert "macros" in data

def test_patient_crud():
    import random
    # Create with random CPF to avoid duplicate error
    cpf = f"{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(100,999)}-{random.randint(10,99)}"
    payload = {"name": "Test Patient", "cpf": cpf, "sex": "M", "birth_date": "1990-01-01"}
    response = client.post("/patients/", json=payload)
    assert response.status_code == 200
    patient_id = response.json()["id"]
    
    # Read
    response = client.get(f"/patients/{patient_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Patient"
    
    # Update
    response = client.put(f"/patients/{patient_id}", json={"name": "Updated Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    
    # Delete
    response = client.delete(f"/patients/{patient_id}")
    assert response.status_code == 200
