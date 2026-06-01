from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.firebase_init import initialize_firebase # initialize Firebase connection when backend starts
from rq_dashboard_fast import RedisQueueDashboard
from tasks.seed import start_seed

from routes import (
    user,
    star_feedback,
    audio_analysis,
    heygen,
    assemblyai,
    llm,
    interview,
)


api_description = """
This API provides a simple interface to the various ML models used in Digital Coach. 
## Video Transcript 
AssemblyAI provides the simple transcription service. 
## Feedback
Provided feedback is Star Scores, competency scores, and statistical feedback.  
"""

app = FastAPI(
    title="MLAPI",
    description=api_description,
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Handles any setup that needs to occur when the FastAPI server starts, e.g. setting up Firebase Admin SDK.
    """
    
    # Initializes Firebase Admin SDK
    print("Initializing Firebase Admin SDK...")
    initialize_firebase()
    print("Firebase Admin SDK initialized")

@app.get("/")
def root():
    return {
        "message": "Welcome to the Digital Coach API, please see '/docs' for information on the server's endpoints as well as being able to test them. If you want to access the Redis Queue (RQ) Dashboard to monitor your jobs, please see '/rq'. If you want to seed your database, please see '/seed'."
    }

@app.get("/seed")
async def seed():
    try:
        print("Seeding Firebase...")
        await start_seed()
        print("Done seeding Firebase!")
        return {
            "message": "Firebase services seeded successfully!"
        }
    except Exception as e: 
        return {
            "message": f"Error seeding Firebase: {e} Please try seeding again."
        }


# Create Redis Queue (RQ) Dashboard to monitor RQ
dashboard = RedisQueueDashboard("redis://redis:6379/", "/rq")
# Access dashboard at localhost:8000/rq
app.mount("/rq", dashboard)

# Add routes here
app.include_router(user.router)
app.include_router(star_feedback.router)
app.include_router(audio_analysis.router)
app.include_router(heygen.router)
app.include_router(assemblyai.router)
app.include_router(llm.router)
app.include_router(interview.router)