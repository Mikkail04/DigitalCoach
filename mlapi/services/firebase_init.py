"""
Handles setting the connection to Firebase services either emulators or production.
"""
import firebase_admin
from firebase_admin import firestore_async, credentials, auth
import os
from dotenv import load_dotenv
from utils.logger_config import get_logger

logger = get_logger(__name__) # create logging instance to view outputs on Docker

def initialize_firebase(): 
    """
    Initializes Firebase Admin SDK. Note that the environment variables in the docker-compose.yml file FIREBASE_XYZ_EMULATOR_HOST tells the Admin SDK to use emulators. Thus, they must be removed to use real services
    """

    # Check if Firebase app has already been created
    if firebase_admin._apps:
        return firebase_admin.get_app()

    load_dotenv() # load environment variables
    projectId = os.getenv("GCLOUD_PROJECT", "demo-digital-coach") # default to project id for using emulators
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    logger.info(f"Checking {service_account_path} for service account credentials.")
    if os.path.exists(service_account_path):
        logger.info(f"Found service account path!")
        cred = credentials.Certificate(service_account_path)
        return firebase_admin.initialize_app(cred, options={"projectId": projectId})
    else:
        logger.warning(f"No service account file not found, attempting to use default credentials...")
        return firebase_admin.initialize_app()

        
def get_firestore_client():
    """
    Initializes Firebase Admin SDK and then returns Firestore asynchronous client, i.e. connection to firestore database.
    """
    initialize_firebase()
    return firestore_async.client()

def get_auth_client():
    """
    Initializes Firebase Admin SDK and returns authentication instance (handles Authentication operations)
    """
    initialize_firebase()
    return auth