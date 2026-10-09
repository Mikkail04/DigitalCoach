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
import requests
from schemas import (
    AAI_Token,
)

# imports for get_sentiment_analysis
from pydantic import BaseModel
from schemas import SentimentResult
from typing import List, Optional

class SentimentAnalysisByTranscriptResponse(BaseModel):
    transcript_id: str
    status: str
    sentiment_analysis_results: List[SentimentResult]
    error: Optional[str] = None


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

    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "digital-coach-app", ".env"))
    api_key = os.getenv("ASSEMBLY_API_KEY")
    if not api_key:
        raise KeyError("ASSEMBLY_API_KEY key not found in .env file.")
    
    client = StreamingClient(
        StreamingClientOptions(
            api_key=api_key,
            api_host="streaming.assemblyai.com",
        )
    )

    token = client.create_temporary_token(expires_in_seconds=60) # authentication token expires after 1 minute
    logger.info("AssemblyAI authentication token request successful!")
    return AAI_Token(token=token) 

# POST /api/assemblyai/sentiment/{transcript_id}
@router.post(
    "/sentiment/{transcript_id}",
    response_model=SentimentAnalysisByTranscriptResponse,
    summary="Generate sentiment analysis from AssemblyAI for the given transcript",
    description=("Fetch sentiment analysis results from AssemblyAI using an existing transcript ID."),
)
async def get_sentiment_analysis(transcript_id: str):
    """
    Returns sentiment analysis results given a transcript id

    Args: 
        transcript_id: The transcript id of transcription to be analyzed

    Note:
        AssemblyAI only returns sentiment results if "sentiment_analysis=true" 
        is enabled.

    Returns:
        SentimentAnalysisByTranscriptResponse

    Raises:
        HTTPException: If the transcript id is not valid
    """
    transcript_id = transcript_id.strip()
    if not transcript_id:
        raise HTTPException(status_code=400, detail="transcript_id cannot be empty")

    logger.info(f"Requesting sentiment analysis from AssemblyAI for transcript_id: {transcript_id}")

    load_dotenv()
    api_key = os.getenv("ASSEMBLY_API_KEY")
    if not api_key:
        raise KeyError("ASSEMBLY_API_KEY key not found in .env file.")
    
    headers = {"authorization": api_key}
    transcript_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"

    try:
        response = requests.get(transcript_endpoint, headers=headers, timeout=30)
    except requests.RequestException as e:
        logger.error(f"AssemblyAI request failed: {str(e)}")
        raise HTTPException(status_code=502, detail=str(e))
    
    # for other status codes 
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=str(response.status_code))
    if response.status_code >= 400:
        logger.error(f"AssemblyAI returned error ({response.status_code}): {response.text}")
        raise HTTPException(status_code=502, detail=str(response.status_code))

    data = response.json()
    status = data.get("status", "unknown")
    error = data.get("error")

    if status == "error":
        return SentimentAnalysisByTranscriptResponse(
            transcript_id=transcript_id,
            status=status,
            sentiment_analysis_results=[],
            error=error or "AssemblyAI transcript processing failed"
        )

    if status != "completed":
        return SentimentAnalysisByTranscriptResponse(
            transcript_id=transcript_id,
            status=status,
            sentiment_analysis_results=[],
            error=("Transcript is not completed yet. Retry after processing finishes.")
        )

    results = data.get("sentiment_analysis_results") or []
    if not results:
        raise HTTPException(status_code=409,detail=("No sentiment analysis results found for this transcript. Ensure 'sentiment_analysis=true' was enabled at time of transcription creation."))

    normalized_results = [
        SentimentResult(
            text=item.get("text", ""),
            sentiment=item.get("sentiment", "NEUTRAL"),
            confidence=float(item.get("confidence", 0.0)),
            start=int(item.get("start", 0)),
            end=int(item.get("end", 0)),
        )
        for item in results
    ]

    return SentimentAnalysisByTranscriptResponse(
        transcript_id=transcript_id,
        status=status,
        sentiment_analysis_results=normalized_results,
        error=None,
    )