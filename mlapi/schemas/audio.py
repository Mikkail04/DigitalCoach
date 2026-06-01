# Audio analysis schemas for sentiment analysis
from enum import Enum
from pydantic import BaseModel
from typing import List
from schemas.jobs import JobStatus

class AAI_Token(BaseModel):
    """
    Response model for returning a temporary authentication token for the client to interact with AssemblyAI API.
    """
    token: str

class Sentiments(str, Enum):
    """
    Audio sentiments detected by AssemblyAI
    """

    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"

class SentimentResult(BaseModel):
    """
    Individual sentiment analysis result for a text segment
    """

    text: str # text segment/sentence
    sentiment: Sentiments  # "POSITIVE", "NEUTRAL", or "NEGATIVE"
    confidence: float  # AI model's confidence score [0,1]
    # start: int  # Start time in milliseconds
    # end: int  # End time in milliseconds

class SentimentAnalysisResult(BaseModel):
    """
    Result of audio sentiment analysis by AssemblyAI
    """
    sentiment_analysis: List[SentimentResult] = []
    
class SentimentAnalysisJobResponse(BaseModel):
    """
    Response model for audio analysis job
    """

    status: JobStatus
    result: SentimentAnalysisResult | None = None
    error: str | None = None

class SentimentAnalysisRequest(BaseModel):
    """
    Request to start an audio analysis job
    
    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
    """
    user_id: str
    interview_id: str

class FillerHedgeRequest(BaseModel):
    """
    Request model to start a filler word and hedge phrase extraction/count job

    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
    """
    user_id: str
    interview_id: str

class FillerHedgeResponse(BaseModel):
    """
    Response model to filler word and hedge phrase extraction/count job.
    """

    filler_count: int # Total number of contextual fillers
    hedge_count: int # Total number of hedge phrases
    most_frequent: List[str] # A short list of the specific phrases the user relied on most.
    