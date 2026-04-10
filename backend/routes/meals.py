from fastapi import APIRouter, HTTPException
from datetime import date
from datetime import datetime
from backend.db.database import get_connection
from pydantic import BaseModel


router = APIRouter()

# This defines the shape of data we expect from the frontend on save
class MealSaveRequest(BaseModel):
    dishName: str
    nutrition: dict
    qualityScore: int

@router.get("/meals/today")
def get_todays_meals():
    """
    Returns all meals logged today.
    Frontend calls this on page load to populate the dashboard.
    """
    today = date.today().isoformat()  # gives "2026-03-29"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            id, dish_name, calories, protein_g, carbs_g,
            fat_g, fiber_g, sodium_mg, sugar_g, 
            quality_score, logged_at
        FROM meals
        WHERE logged_at LIKE ?
        ORDER BY logged_at ASC
    """, (f"{today}%",))  # the % means "anything after this"

    rows = cursor.fetchall()
    conn.close()

    # Convert each row to a plain dictionary so FastAPI can return it as JSON
    meals = [dict(row) for row in rows]

    return {"meals": meals, "date": today}

@router.post("/meals/save")
def save_meal(meal: MealSaveRequest):
    """
    Called only when user confirms the analysis and taps
    'Yes, Log This Meal'. Saves to SQLite at that point.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO meals 
            (dish_name, calories, protein_g, carbs_g, fat_g,
             fiber_g, sodium_mg, sugar_g, quality_score, logged_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        meal.dishName,
        meal.nutrition.get("calories"),
        meal.nutrition.get("protein_g"),
        meal.nutrition.get("carbs_g"),
        meal.nutrition.get("fat_g"),
        meal.nutrition.get("fiber_g"),
        meal.nutrition.get("sodium_mg"),
        meal.nutrition.get("sugar_g"),
        meal.qualityScore,
        datetime.now().isoformat(),
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"message": "Meal saved successfully", "id": new_id}

@router.delete("/meals/{meal_id}")
def delete_meal(meal_id: int):
    """
    Deletes a specific meal by its id.
    Frontend calls this when user taps the delete button on a meal card.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # First check the meal actually exists
    cursor.execute("SELECT id FROM meals WHERE id = ?", (meal_id,))
    meal = cursor.fetchone()

    if not meal:
        conn.close()
        raise HTTPException(status_code=404, detail="Meal not found")

    cursor.execute("DELETE FROM meals WHERE id = ?", (meal_id,))
    conn.commit()
    conn.close()

    return {"message": "Meal deleted successfully", "id": meal_id}