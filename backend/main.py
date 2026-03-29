from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from db.database import init_db
from routes import analyze, meals


@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs once when the server starts
    init_db()
    print("Database initialized successfully")
    yield
    # Anything after yield runs when server shuts down (we have nothing to clean up)


app = FastAPI(title="Food Logger API", lifespan=lifespan)

# CORS — allows your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production you'd lock this to your actual domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes — these are the URLs your frontend will call
app.include_router(analyze.router, prefix="/api")
app.include_router(meals.router, prefix="/api")

# Serve the frontend folder as static files
# This means visiting localhost:8000 will serve your HTML/CSS/JS
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")