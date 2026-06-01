"""
Routes for HeyGen related services like starting a session with an avatar.
"""
from fastapi import APIRouter, HTTPException
from schemas import HeyGenSessionRequest
from utils.logger_config import get_logger
import requests
from dotenv import load_dotenv
import os

logger = get_logger(__name__) # create a logger instance to log messages

router = APIRouter(prefix="/api/heygen", tags=["interview"])

# GET /api/heygen/session_token
@router.get(
    "/session_token",
    summary="Requests a session token from HeyGen's LiveAvatar API.",
    description="Gets a session token from HeyGen's LiveAvatar API."
) 
async def get_session_token():
    """
    Creates session token for end user based on predefined session configurations for how the avatar looks, how it sounds, and what's its knowledge base. You can create new context within HeyGen's LiveAvatar API website: https://app.liveavatar.com/home

    Returns:
        session_token (str): String containing the session token for a HeyGen LiveAvatar session.

    Raises:
        KeyError: If the HeyGen LiveAvatar API key is missing.
        ValueError: If the session configuration settings are invalid.
    """
    # URL to send to request to get session token from HeyGen LiveAvatar
    url = "https://api.liveavatar.com/v1/sessions/token"

    # default session configuration
    interviewConfig = {
      "avatar_id": "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a", # ID for one of HeyGen LiveAvatar's avatars to choose what it looks like. 
      # sandbox avatar: dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
      # production avatar: 65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0
      "voice_id": "c2527536-6d1f-4412-a643-53a3497dada9", # ID for one of HeyGen LiveAvatar's voices to choose how it sounds like. 
      # sandbox voice: c2527536-6d1f-4412-a643-53a3497dada9
      # production voice: b2bd6569-a537-4342-aeca-a1f15d2a2c97
      "context_id": "e6a7bbca-1ac1-4a2f-b0f0-f6cfce199b97", # ID for Context created in HeyGen LiveAvatar to choose how the avatar behaves and what it knows. 
      # current context: "e6a7bbca-1ac1-4a2f-b0f0-f6cfce199b97" 
      "is_sandbox": True # HeyGen LiveAvatar has a sandbox mode so the developer can test without using credits under strict session configurations. (Only one avatar is available in sandbox mode)
    }

    # Session configuration
    payload = {
        "mode": "FULL", # LiveAvatar has two modes FULL or CUSTOM
        "avatar_id": interviewConfig["avatar_id"], 
        "is_sandbox": interviewConfig["is_sandbox"],
        "avatar_persona": {
            "voice_id": interviewConfig["voice_id"],
            "context_id": interviewConfig["context_id"],
            "language": "en" # LiveAvatar supports other language but we assume that the interaction will be in English 
        }
    }
    logger.info("Attempting to retrieve HeyGen session token...")

    # Attempt to get session token
    try:
        # load variables from .env
        load_dotenv()
        # get LiveAvatar API key
        api_key = os.getenv("HEYGEN_LIVEAVATAR_API")
        if not api_key: 
            raise KeyError("HEYGEN_LIVEAVATAR_API key not found in .env file.")
        
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "X-API-KEY": api_key,
        }

        # Debug session configuration
        # print(f"Payload: {payload}")
        # print(f"Headers: {headers}")

        # Send request to HeyGen LiveAvatar
        print("Getting Session Token...")
        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            raise ValueError(f"Failed to create session token: {response.json()['message']}")

        # print(response.text)
        session_token = response.json()["data"]["session_token"] 
        print(f"\nSession token: {session_token}")
        return session_token
    except KeyError as e:
        logger.error(f"Can't start HeyGen session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting HeyGen session: {str(e)}")
    except ValueError as e:
        logger.error(f"Failed to retrieve session token: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to retrieve session token: {str(e)}")