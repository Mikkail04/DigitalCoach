from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.firebase_setup import (
    initialize_firebase,
)  # initialize Firebase connection when backend starts
from rq_dashboard_fast import RedisQueueDashboard
from routes import (
    jobs,
    create_answer,
    star_feedback,
    audio_analysis,
    heygen,
    assemblyai,
    llm,
    interview,
    test_firebase,  # this is for testing backend's connection to firebase
)
import os

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
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",

#         "https://digital-coach-eta.vercel.app",
#         "https://digital-coach-9y96zagki-youngkels04-8891s-projects.vercel.app",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://digital-coach-eta.vercel.app",
    ],
    allow_origin_regex=r"https://digital-coach-[a-z0-9-]+\.vercel\.app",
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
        "message": "Welcome to the Digital Coach API, please see `/docs` for more information. If you want to access the Redis Queue (RQ) Dashboard to monitor your jobs, please see /rq."
    }


# Create Redis Queue (RQ) Dashboard to monitor RQ
# dashboard = RedisQueueDashboard("redis://redis:6379/", "/rq")
redis_url = os.getenv("REDIS_URL", "redis://redis:6379")

dashboard = RedisQueueDashboard(redis_url, "/rq")
# Access dashboard at localhost:8000/rq
app.mount("/rq", dashboard)

# Add routes here
app.include_router(jobs.router)
app.include_router(create_answer.router)
app.include_router(star_feedback.router)
app.include_router(audio_analysis.router)
app.include_router(heygen.router)
app.include_router(assemblyai.router)
app.include_router(llm.router)
app.include_router(interview.router)
app.include_router(test_firebase.router)  # this is for testing only
