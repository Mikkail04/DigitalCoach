"""
User's Performance Feedback Schemas
"""

from pydantic import BaseModel, Field
from typing import List
from schemas.jobs import JobStatus

class CompetencyFeedback(BaseModel):
    """
    Feedback for a specific competency
    """

    score: float # Overall score
    summary: str # States whether or not the user was compotent in some field 

class OverallCompetencyFeedback(BaseModel):
    """
    Overall Competency Feedback
    """

    clarity: CompetencyFeedback  # Evaluation on communication clarity
    confidence: CompetencyFeedback # Evaluation on confidence
    engagement: CompetencyFeedback # Evaluation on engagement
    star: CompetencyFeedback # Evaluaton on STAR
    # overall_score: float # Overall score
    # summary: str # Summary of overall performance including evaluations for individual competencies

class CompetencyFeedbackRequest(BaseModel):
    """
    Request model for competency feedback.

    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
    """
    user_id: str
    interview_id: str

class StarFeedbackRequest(BaseModel):
    """
    Request model for STAR feedback.
    
    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
    """
    user_id: str
    interview_id: str
    
class StarBreakdown(BaseModel):
    """
    The deconstruction of a user's response against the STAR framework.
    """

    situation: str # the situation the user described
    task: str # the task/goal the user described
    action: str # the action the user took 
    result: str # the measurable result/outcome


class StarPercentages(BaseModel):
    """
    Percentage breakdown of STAR components for a single response (the percentages are ints to skip conversions)
    """

    situation_percentage: int
    task_percentage: int
    action_percentage: int
    result_percentage: int

class StarAnalysisResult(BaseModel):
    """
    Result of STAR analysis for one question-answer pair.
    """
    question: str # Question asked by interview
    star_breakdown: StarBreakdown # Decomposition of answer against STAR
    star_percentages: StarPercentages


class StarFeedbackEvaluation(BaseModel):
    """
    Results after performing STAR feedback analysis
    """
    star_analysis: List[StarAnalysisResult]
    overall_score: int
    feedback: str

class StarFeedbackResponse(BaseModel):
    """
    Response model for STAR feedback job
    """

    job_id: str
    status: JobStatus
    result: StarFeedbackEvaluation | None = None
    error: str | None = None

class OverallAnalysisRequest(BaseModel):
    """
    Request model for the final overall analysis feedback job.
    Args:
        user_id: The id of the user whose interview we're analyzing
        interview_id: The id of the interview who owns the transcript to analyze
        sentiment_job_id: The id of the related sentiment analysis job.
        star_job_id: The id of the related STAR analysis job.
        competency_job_id: The id of the related competencies analysis job. 
        filler_hedge_job_id: The id of the related filler words and hedge phrases extraction job which must be completed before final analysis can begin.
    """
    user_id: str
    interview_id: str
    sentiment_job_id: str
    star_job_id: str
    competency_job_id: str
    filler_hedge_job_id: str


class OverallAnalysisResponse(BaseModel):
    """
    Reponse model for the final overall analysis feedback job.
    Args:
    """
    overall_feedback: str # user's overall feedback on interview performance in general
    overall_score: int # user's overall interview score