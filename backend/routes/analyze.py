from fastapi import APIRouter, UploadFile, File, HTTPException
from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv
from datetime import datetime

from db.database import get_connection

load_dotenv()

router = APIRouter()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

PROMPT = """
You are an expert nutritionist and dietitian with deep knowledge 
of Indian cuisine and global food dishes.

A user has taken a photo of their meal. Your job is to:
1. Identify the dish(es) and drinks visible in the image
2. Estimate realistic portion sizes based on what is visible
3. Provide an accurate nutritional breakdown for that portion
4. Judge the quality and healthiness of this specific meal
5. Suggest practical improvements the user can make
6. Relate the calorie count to real physical activities

Return ONLY a valid JSON object — no explanation, no markdown, 
just raw JSON — in this exact structure:

{
  "dishName": "Full descriptive name of the meal",
  "confidence": "High or Medium or Low",
  "portionNote": "e.g. One standard plate of dal rice with ghee",
  "description": "Brief description of what this dish typically is",

  "nutrition": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sodium_mg": number,
    "sugar_g": number,
    "saturated_fat_g": number
  },

  "qualityScore": number from 1 to 10,
  "qualityTitle": "e.g. Carb Heavy, Well Balanced, Protein Rich",

  "insights": [
    {
      "type": "warn or good or tip",
      "title": "Short label e.g. High refined carbs",
      "detail": "Specific explanation"
    }
  ],

  "improvements": [
    "Reduce rice quantity by half and increase dal portion",
    "Add a small salad or cucumber slices on the side"
  ],

  "whatMealLacks": ["Vegetables", "Healthy fats"],

  "whatIsInExcess": ["Refined carbohydrates", "Sodium"],

  "activities": [
    {
      "emoji": "🏃",
      "name": "Running",
      "duration": "22 mins",
      "detail": "at a moderate pace of 8 km/h"
    }
  ]
}

Be specific to Indian meals when relevant. If you see dal, roti,
rice, sabzi, biryani, idli, dosa etc., use your knowledge of 
authentic Indian portion sizes and cooking methods for accurate 
nutrition values. Include at least 4 insights and 6 activities.
Do not guess wildly — if confidence is low, say so but still 
give your best estimate.
"""


@router.post("/analyze")
async def analyze_meal(file: UploadFile = File(...)):
    image_bytes = await file.read()

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=file.content_type,  
                ),
                PROMPT,
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    try:
        raw_text = response.text
        cleaned = raw_text.strip().removeprefix("```json").removesuffix("```").strip()
        analysis = json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {str(e)}")

    return analysis