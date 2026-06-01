"""
Seed file used to populate Firebase services with mock data. This script is to be run within the backend's Docker container because it uses the Firebase Admin SDK.
"""
from services import firebase_init
import requests
from datetime import datetime
from schemas import Interview
from pydantic import ValidationError
from dotenv import load_dotenv
import time
import os

def drop_emulator_data():
    """
    Deletes the data from Firebase Emulators, i.e. Authentication and Firestore 
    """

    print("Dropping emulator data...")
    PROJECT_ID = "demo-digital-coach"    
    # clear firestore
    firestore_url = f"http://firebase:8080/emulator/v1/projects/{PROJECT_ID}/databases/(default)/documents"
    try:
        requests.delete(firestore_url) # send DELETE request
        print("Firestore data cleared!")
    except Exception as e:
        print(f"Failed to clear Firestore data: {e}")

    # clear authenticator
    auth_url = f"http://firebase:9099/emulator/v1/projects/{PROJECT_ID}/accounts"
    try:
        requests.delete(auth_url)
        print("Authentication data cleared!")
    except Exception as e:
        print(f"Failed to clear Authentication data: {e}")

async def drop_data():
    """
    Deletes the data from Firebase Cloud Services, i.e. Authentication and Firestore 
    """

    print("Recursively deleting Firestore data...")
    db = firebase_init.get_firestore_client() # get Firestore instance
    users_ref = db.collection("users") # get user collection reference
    await db.recursive_delete(users_ref)
    print("Firestore data cleared!")

    print("Deleting Authentication data...")
    auth = firebase_init.get_auth_client() # get Authentication instance
    seed_users = ["testuser1"] # list of all user ids for the seeded users 
    auth.delete_users(seed_users) # delete all seeded users (deletions could fail for individual users but we assume they won't)
    print("Authentication data cleared!")

async def start_seed():
    """
    Seeds Firebase Services with data, e.g. add users.
    """
    auth = firebase_init.get_auth_client()
    db = firebase_init.get_firestore_client()
    
    # clear out current data
    load_dotenv()

    # check if we're seeding emulators or the cloud services
    use_emulators = os.getenv("FIREBASE_USE_EMULATORS") 
    
    if (use_emulators == "true"):
        drop_emulator_data()
        print("Seeding Emulators...")
    else:
        await drop_data()
        print("Seeding Cloud Firebase Services...")

    # add new data
    user1 = auth.create_user(
        uid = "testuser1",
        email="marzia@talon.com",
        password="Vendetta@29",
    )
    interview1 = {
        "id": "vsoSA7V72JFdBPMLJL29",
        "date": "03/04/2024", # MM/DD/YY
        "timestamp": int(time.time() * 1000), # timestamp when interview was created in milliseconds since the epoch 
        "timeStarted": datetime.now().strftime("%m/%d/%Y, %H:%M"), # HH:MM 12-hour
        "duration": "5m 30s", # MMm SSs (not 0-padded)
        "feedback": {
            "ai_feedback": "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
            "overall_competency": {
                "clarity": {
                    "score": 8,
                    "summary": "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow.",
                },
                "confidence": {
                    "score": 10,
                    "summary": "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!",
                },
                "engagement": {
                    "score": 9,
                    "summary": "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses.",
                },
                "star": {
                    "score": 8,
                    "summary": "To elevate your solid foundation, focus on quantifying your 'Result' with concrete metrics and explicitly highlighting your individual contributions rather than just the team's effort during the 'Action' phase."
                }
            },
        },
        "metrics": {
            "filler_count": 2,
            "overall_score": 99,
            "wpm": 100,
        },
        "transcript": 
        """
            Interviewer: Hi Alex, thanks for taking the time to speak with me today. To kick things off, could you tell me about a recent software project you worked on and a specific technical challenge you had to overcome?

            Marzia Bartalotti: Hi, yes, absolutely. Um, to be honest, I'm a little bit nervous, but I'm really excited to be here. So, recently, I worked on a full-stack web application. The biggest hurdle was definitely optimizing the database queries. Initially, the main user dashboard was loading incredibly slowly—it was taking almost five seconds to render. I felt pretty frustrated because I just couldn't figure out the bottleneck at first.

            Interviewer: That does sound stressful. How did you end up resolving it?

            Marzia Bartalotti: Well, I stepped back, dug into the documentation, and realized I was making a classic N+1 query error. Once I understood the root of the problem, I felt a lot more confident. I restructured the backend logic to use batch processing and implemented some basic indexing. Seeing the load time drop to under 200 milliseconds was incredibly rewarding. I'm actually really proud of how that turned out.
        """,
        "sentiment": "POSITIVE",
        "url": "https://google.com",
        "is_analyzed": True,
    }
    interview2 = {
        "id": "k8nLB9X23mRpTQXCZK44",
        "date": "05/12/2026", # MM/DD/YY
        "timestamp": int(time.time() * 1000)+1, # timestamp when interview was created in milliseconds since the epoch (the +1 is for the seed data ONLY because the timestamps match when seeding the database which doesn't reflect realistic use)
        "timeStarted": datetime.now().strftime("%m/%d/%Y, %H:%M"), # HH:MM 12-hour
        "duration": "12m 15s", # MMm SSs (not 0-padded)
        "feedback": {
            "ai_feedback": "You demonstrate a high level of technical authority and leadership. Your explanation of system architecture was top-tier. However, your answers tended to run long, which occasionally led to the interviewer cutting you off to stay on schedule. For future rounds, aim for 'Bluf' (Bottom Line Up Front) to ensure your main point isn't lost in the detail.",
            "overall_competency": {
                "clarity": {
                    "score": 6,
                    "summary": "Your WPM was high (175); while you are articulate, the speed made it difficult to digest complex architectural concepts.",
                },
                "confidence": {
                    "score": 10,
                    "summary": "Zero filler words detected. You maintained a steady, authoritative tone throughout the technical deep-dive.",
                },
                "engagement": {
                    "score": 7,
                    "summary": "You were highly expressive, but you dominated the conversation. Try to leave more 'white space' for the interviewer to interject.",
                },
                "star": {
                    "score": 9,
                    "summary": "Excellent use of the STAR method. Your 'Result' section included specific revenue impact (15% increase), which is exactly what hiring managers look for."
                }
            },
        },
        "metrics": {
            "filler_count": 0,
            "overall_score": 85,
            "wpm": 175,
        },
        "transcript": 
        """
            Interviewer: Thanks for joining us, Mariza. Can you describe a time you had to lead a team through a significant technical pivot?

            Mariza Bartalotti: Absolutely. Last year at CloudSync, we were halfway through a legacy migration when we realized our chosen microservices framework couldn't handle the projected concurrency spikes for Q4. It was a high-stakes moment. I called an emergency sync, presented the load-test data, and proposed a shift to a Go-based architecture for the edge services. 

            Interviewer: That's a big shift mid-project. How did the team react to the change in stack?

            Mariza Bartalotti: There was initial resistance because of the learning curve, but I organized a three-day 'internal boot camp' to get everyone up to speed. By leading the first few pull requests myself, I showed the team that the developer experience was actually better. We hit our Q4 targets with 99.99% uptime, and the pivot actually reduced our infrastructure costs by 15% due to better resource efficiency.
        """,
        "sentiment": "POSITIVE",
        "url": "https://zoom.us/rec/example-id",
        "is_analyzed": True,
    }


    # verify seed data follows the correct Pydantic schemas
    try:
        # verify interview data follows the interview pydantic schema
        Interview.model_validate(interview1)
        Interview.model_validate(interview2)
    except ValidationError as e:
        print(f"Seed data doesn't follow Pydantic schema(s): {e}")
        raise Exception(f"Seed data doesn't follow Pydantic schema(s): {e}")

    data1 = { 
        "avatarURL": "https://picsum.photos/200",
        "concentration": "Technology",
        "createdAt": datetime.now().strftime("%m/%d/%Y"),
        "email": "marzia@talon.com",
        "hasCompletedInterview": False,
        "id": user1.uid,
        "name": "Marzia Bartalotti",
        "proficiency": "Student",
        "registrationCompletedAt": datetime.now().strftime("%m/%d/%Y"),
    }
    await db.collection("users").document(f"{user1.uid}").set(data1) # add user
    
    # add interviews to user's account
    await db.collection("users").document(f"{user1.uid}").collection("interviews").document(interview1["id"]).set(interview1)
    await db.collection("users").document(f"{user1.uid}").collection("interviews").document(interview2["id"]).set(interview2)

    print(f"Created user with authentication id={user1.uid}")