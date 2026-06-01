from fastapi import APIRouter, HTTPException, status
from utils.logger_config import get_logger
from schemas import CreateUserResponse, CreateUserRequest, GetUserRequest, GetUserResponse
from services.firebase_init import get_firestore_client
import cloudinary
from dotenv import load_dotenv
import os
import time
from data.users import getUser

logger = get_logger(__name__) # create a logger instance to log messages

router = APIRouter(prefix="/api/user", tags=["user"])

# POST /api/user
@router.post(
    "/",
    response_model=CreateUserResponse,
    summary="Create partially populated user document given after user finishes signup.",
    description="Creates user document populated with initial data from user's signup.",
)
async def create_user(request: CreateUserRequest):
    db = get_firestore_client()
    logger.info(f"Attempting to create new user document...")
    try:
        # convert user pydantic object into a dictionary
        user = request.user.model_dump()

        # add user document to collection
        await db.collection("users").add(user)

        logger.info("Inserted new user!")
        return CreateUserResponse(success=True)
    except Exception as e:
        logger.info(f"Failed to create user: {e}")
        return CreateUserResponse(success=False)

# GET /api/user
@router.get(
    "/",
    response_model=GetUserResponse,
    summary="Get user document given id.",
    description="Retrieves an user document with a given id.",
)
async def get_user(request: GetUserRequest):
    
    logger.info(f"Attempting to retrieve user document with id {request.userId}...")
    try:
        user = await getUser(request.userId)
        return GetUserResponse(user=user)
    except Exception as e:
        logger.error(f"Unexpected internal server error occurred during getting user id={request.userId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user."
        )

# GET /api/user/profilePic
@router.get(
    "/profilePic",
    summary="Return the signature and timestamp needed for secure uploads to Cloudinary.",
    description="Creates a signature and timestamp for the client to make a signed (secure) image upload to Cloudinary."
)
async def get_signature():
    logger.info("Creating signature and timestamp...")  
    load_dotenv()
    try:
        api_secret = os.getenv("CLOUDINARY_API_SECRET")
        if not api_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing API Secret"
            )
        
        # generate signature and timestamp required by Cloudinary for signed uploads
        timestamp = int(time.time()) # timestamp in seconds
        signature = cloudinary.utils.api_sign_request(
            {
                "timestamp": timestamp,
                # "upload_preset": "ml_default" (optional for signed uploads and must match NEXT_PUBLIC_UPLOAD_PRESET in digital-coach-app/.env)
            },
            api_secret
        )
        logger.info("Signature and timestamp created!")
        return {"signature": signature, "timestamp": timestamp}
    except HTTPException:
        logger.error(f"Can't get signature")
        raise
    except Exception as e:
        logger.error(f"Can't get signature: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred uploading image."
        )