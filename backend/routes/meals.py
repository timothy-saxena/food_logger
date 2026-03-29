from fastapi import APIRouter, HTTPException
from datetime import date
from db.database import get_connection

router = APIRouter()


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