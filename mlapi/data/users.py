"""
Data functions related to users.
"""

from services.firebase_init import get_firestore_client
from utils.logger_config import get_logger
from schemas.user import User
from pydantic import ValidationError
from google.cloud import firestore
from fastapi import HTTPException, status

logger = get_logger(__name__)

async def getUser(user_id: str) -> User:
    """
    Returns the document with the given user id.

    - **user_id** (str): Id of the user.
    """ 

    db = get_firestore_client()
    logger.info(f"Attempting to get user={user_id}...")
    
    try:
        userRef = db.collection("users").document(user_id)
        userDoc = await userRef.get()
        if not userDoc.exists:
            logger.error(f"User with user_id={user_id} not found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        logger.info(f"User id={user_id} found!")
        userData = userDoc.to_dict()
        print(userData)
    except HTTPException:
        raise # re-raise exception for FastAPI to handle
    except Exception as e:
        logger.error(f"Internal server error occurred when getting user={user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurred when getting user."
        )
    
    # verify user document is the correct shape
    try:
        logger.info(f"Validating user id={user_id}...")
        validated_user = User.model_validate(userData)
        logger.info(f"User document id={user_id} validation successful!")
        return validated_user
    except ValidationError as e:
        logger.error(f"User id={user_id} doesn't follow the User Pydantic schema: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurred when getting user."
        )