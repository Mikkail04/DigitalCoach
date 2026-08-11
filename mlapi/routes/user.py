from fastapi import APIRouter
from utils.logger_config import get_logger
from schemas import (
    CreateUserResponse,
    CreateUserRequest,
    GetUserRequest,
    GetUserResponse,
)
from services.firebase_setup import get_firestore_client

logger = get_logger(__name__)  # create a logger instance to log messages

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
    db = get_firestore_client()
    logger.info(f"Attempting to retrieve user document with id {request.userId}...")
    try:
        user = await db.collection("users").document(request.userId).get()
        logger.info("Retrieved user!")
        return GetUserResponse(user=user)
    except Exception as e:
        logger.info(f"Failed to retrieve user: {e}")
        return GetUserResponse(user=None)
