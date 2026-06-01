"""
Interview-related schemas
"""

from pydantic import BaseModel
from schemas.feedback import (
    OverallCompetencyFeedback,
)

class Feedback(BaseModel):
    """
    Model representing the AI-generated feedback which provides overall feedback, clarity of responses, confidence in the responses, how engaging the responses were, and how well they follow the STAR response structure.
    
    (Note: This should match the IFeedback interface in /digital-coach-app/lib/interview/models.ts)
    """
    ai_feedback: str | None
    overall_competency: OverallCompetencyFeedback | None

class Metrics(BaseModel):
    """
    Metrics based on user's performance during the interview, e.g. how many filler words were detected
    """
    filler_count: int | None # how many filler words were used
    overall_score: int | None # overall interview performance score
    wpm: int | None # user's words per minute (pacing)

class SentimentPercents(BaseModel):
    """
    Model representing the shape of the overall sentiment analysis percentages.
    """
    positive: int # percentage of the responses that were positive sentiment
    negative: int # percentage of the responses that were negative sentiment
    neutral: int  # percentage of the responses that were neutral sentiment

class Interview(BaseModel): 
    """
    Model representing an interview 
    
    (Note: This should match the IInterview interface in /digital-coach-app/lib/interview/models.ts)
    """
    id: str # id for the interview
    date: str # MM/DD/YYYY
    timestamp: int # timestamp of when interview was created using milliseconds elapsed since the epoch (this is used as a way to sort interviews chronologically)
    timeStarted: str # HH:MM 12-hour
    duration: str # MMm SSs, e.g. 10m 43s not 0-padded
    feedback: Feedback | None = None
    metrics: Metrics | None = None
    transcript: list[str] | str | None = None # transcript may either be an array of dialogues from avatar and user or a single long string
    sentiment: str | SentimentPercents | None = None
    url: str | None = None # download for user's side of the interview
    is_analyzed: bool = False # flag representing when an interview has completed their analysis

class CreateInterviewRequest(BaseModel):
    """
    Model representing the shape of the request made from the client to create a new interview document. 
    """
    userId: str # user's id from Firebase Authentication
    interview: Interview # partially filled interview to insert

class CreateInterviewResponse(BaseModel): 
    """
    Model representing the response made after creating a new interview.
    """
    # ids of the analysis jobs started on the interview
    sentiment_job_id: str = ""
    star_job_id: str = ""
    competency_job_id: str = ""
    overall_job_id: str = ""
    filler_hedge_job_id: str = ""

    success: bool

class AnalyzeInterviewRequest(BaseModel):
    """
    Model representing the shape for requesting an analysis of an interview which includes tasks like sentiment analysis and feedback generation.
    """
    user_id: str
    interview_id: str

class AnalyzeInterviewResponse(BaseModel):
    """
    Model representing the shape of the response to an analysis of an interview.
    """
    sentiment_job_id: str
    star_job_id: str
    competency_job_id: str
    filler_hedge_job_id: str
    overall_job_id: str

class GetInterviewRequest(BaseModel):
    """
    Model representing the shape of the request made from the client to retrieve an interview document.
    """
    userId: str # user's id from Firebase Authentication
    interviewId: str # interview id

class GetInterviewResponse(BaseModel):
    """
    Model representing the response made from retrieving an interview.
    """
    interview: Interview | None
