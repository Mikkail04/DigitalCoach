# Handles orchestration of tasks for interview videos, e.g. starting analysis jobs. 
# Can be called by route handlers.

from tasks.ml_tasks import (
    detect_audio_sentiment,
    star_analysis,
    analyze_competencies,
    overall_analysis,
    filler_hedge_count,
) 
from redisStore.queue import add_task_to_queue
from utils.logger_config import get_logger
from schemas import (
    SentimentAnalysisRequest,
    StarFeedbackRequest,
    CompetencyFeedbackRequest,
    AnalyzeInterviewRequest,
    AnalyzeInterviewResponse,
    OverallAnalysisRequest,
    FillerHedgeRequest,
)

logger = get_logger(__name__)

def start_sentiment_analysis(req: SentimentAnalysisRequest) -> str:
    """
    Start the sentiment analysis job by adding it to the queue.
    
    Args:
        req (SentimentAnalysisRequest): Contains the params to perform the sentiment analysis job.
    Returns:
        job_id (str): The Redis Job id of the queued sentiment analysis job.
    """
    logger.info(f"Started sentiment analysis job for interview={req.interview_id}.")
    
    # Enqueue sentiment analysis job
    # only pass the fields instead of the pydantic model
    job = add_task_to_queue("high", detect_audio_sentiment, req.user_id, req.interview_id)

    logger.info(f"Sentiment analysis for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # returns job id for polling later

def start_star_analysis(req: StarFeedbackRequest) -> str:
    """
    Start the STAR feedback analysis job by adding it to the queue.
    
    Args:
        req (StarFeedbackRequest): Contains the params to perform the STAR analysis.
    Returns:
        str: The job ID of the queued STAR feedback analysis job.
    """

    logger.info(f"Started STAR analysis job for interview={req.interview_id}.")
    
    # Enqueue STAR feedback analysis job
    job = add_task_to_queue("high", star_analysis, req.user_id, req.interview_id)

    logger.info(f"STAR analysis for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # return job id for polling

def start_competency_analysis(req: CompetencyFeedbackRequest) -> str:
    """
    Start the competency analysis job by adding it to the queue.
    
    Args:
        req (CompetencyFeedbackRequest): Contains the params to perform the competency analysis.
    Returns:
        str: The job ID of the queued competencies analysis job.
    """
    logger.info(f"Started competency analysis job for interview={req.interview_id}.")

    # Enqueue competency analysis job
    job = add_task_to_queue("default", analyze_competencies, req.user_id, req.interview_id)

    logger.info(f"Competencies analysis for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # return job id for polling

def start_filler_hedge_count(req: FillerHedgeRequest) -> str:
    """
    Start the filler word and hedge phrase count job by adding it to the queue.

    Args:
        user_id (str): Id of the user who owns the interview.
        interview_id (str): Id of the interview to perform the count on.
    Returns:
        str: The job ID of the queued filler/hedge count job.
    """

    logger.info(f"Started filler/hedge count job for interview={req.interview_id}.")

    # Enqueue filler/hedge job
    job = add_task_to_queue("default", filler_hedge_count, req.user_id, req.interview_id)

    logger.info(f"Filler/hedge count for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # return job id for polling

def start_overall_analysis(req: OverallAnalysisRequest) -> str:
    """
    Start the final overall analysis by adding it to the queue.
    
    Args:
        req (OverallAnalysisRequest): Contains the params to perform the final overall analysis.
    Returns:
        str: The job ID of the queued overall analysis job.
    """
    logger.info(f"Started final overall analysis job for interview={req.interview_id}.")

    # Enqueue overall analysis job (requires all other ML-related jobs to be done first)
    job = add_task_to_queue("default", overall_analysis, req.user_id, req.interview_id, depends_on=[req.sentiment_job_id, req.star_job_id, req.competency_job_id, req.filler_hedge_job_id])

    logger.info(f"Final overall analysis for interview={req.interview_id} job ID={job.id} enqueued!")

    return job.id # return job id for polling 

def start_interview_analysis(req: AnalyzeInterviewRequest) -> AnalyzeInterviewResponse:
    """
    Start the interview analysis job by adding it to the task queue.
    
    All analysis tasks are to start here.

    Args:
        req (AnalyzeInterviewRequest): Request body that contains the fields needed to perform the various interview analysis tasks.
    Returns:
        response (AnalyzeInterviewResponse): The job IDs of the queued interview analysis jobs.
    """
    # Enqueue audio analysis job
    sentiment_analysis_request = SentimentAnalysisRequest(user_id=req.user_id, interview_id=req.interview_id)
    sentiment_job_id = start_sentiment_analysis(sentiment_analysis_request)

    # Enqueue STAR analysis job
    star_analysis_request = StarFeedbackRequest(user_id=req.user_id, interview_id=req.interview_id)
    star_job_id = start_star_analysis(star_analysis_request)

    # Enqueue competencies analysis job
    competency_analysis_request = CompetencyFeedbackRequest(user_id=req.user_id, interview_id=req.interview_id)
    competency_job_id = start_competency_analysis(competency_analysis_request)

    # Enqueue filler/hedge count job 
    filler_hedge_request = FillerHedgeRequest(user_id=req.user_id, interview_id=req.interview_id)
    filler_hedge_job_id = start_filler_hedge_count(filler_hedge_request)
    
    # Enqueue final overall analysis job
    overall_analysis_request = OverallAnalysisRequest(user_id=req.user_id,
                                                      interview_id=req.interview_id,
                                                      sentiment_job_id=sentiment_job_id,
                                                      star_job_id=star_job_id,
                                                      competency_job_id=competency_job_id,
                                                      filler_hedge_job_id=filler_hedge_job_id)
    overall_job_id = start_overall_analysis(overall_analysis_request)
    
    # Invoke other tasks here...

    return AnalyzeInterviewResponse(sentiment_job_id=sentiment_job_id,
                                    star_job_id=star_job_id, competency_job_id=competency_job_id,
                                    filler_hedge_job_id=filler_hedge_job_id,
                                    overall_job_id=overall_job_id)