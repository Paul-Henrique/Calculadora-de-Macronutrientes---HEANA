from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_create_meal():
    response = client.post("/meals/", json={"name": "Test Breakfast"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Breakfast"
    assert "id" in data
    assert data["items"] == []
    return data["id"]

def test_add_item_to_meal():
    # Create meal first
    meal_id = test_create_meal()
    
    # Add item (Assuming food id 1 exists from TACO import)
    response = client.post(
        f"/meals/{meal_id}/items",
        json={"food_id": 1, "quantity": 150}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["food_id"] == 1
    assert data["items"][0]["quantity"] == 150
    # Check if food details are returned (depends on schema/lazy load)
    # assert data["items"][0]["food"]["name"] is not None 

def test_read_meals():
    response = client.get("/meals/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_delete_meal():
    meal_id = test_create_meal()
    response = client.delete(f"/meals/{meal_id}")
    assert response.status_code == 200
    
    response = client.get(f"/meals/{meal_id}")
    assert response.status_code == 404
