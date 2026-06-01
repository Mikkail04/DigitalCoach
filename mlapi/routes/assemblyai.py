"""
Routes for AssemblyAI related services like starting transcriptions.
"""
from fastapi import APIRouter, HTTPException
from assemblyai.streaming.v3 import (
    StreamingClient,
    StreamingClientOptions
)
from utils.logger_config import get_logger
from dotenv import load_dotenv
import os
from schemas import (
    AAI_Token,
)

logger = get_logger(__name__) # create logger instance to log messages

router = APIRouter(prefix="/api/assemblyai", tags=["AssemblyAI"])

# GET /api/assemblyai/token
@router.get(
    "/token",
    response_model=AAI_Token,
    summary="Sends a temporary authentication token from AssemblyAI for the client to make requests to the API.",
    description="Returns an authentication token for client to interact with AssemblyAI API"
)
async def request_token():
    """
    Creates a temporary authentication token for the client to be able to send requests to AssemblyAI API for services like speech-to-text.

    Returns: 
        token: Temporary authentication token
    """
    logger.info("Requesting temporary AssemblyAI authentication token...")

    load_dotenv()
    api_key = os.getenv("AAPI_KEY")
    if not api_key:
        raise KeyError("AAPI_KEY key not found in .env file.")
    
    client = StreamingClient(
        StreamingClientOptions(
            api_key=api_key,
            api_host="streaming.assemblyai.com",
        )
    )

    token = client.create_temporary_token(expires_in_seconds=60) # authentication token expires after 1 minute
    logger.info("AssemblyAI authentication token request successful!")
    return AAI_Token(token=token)