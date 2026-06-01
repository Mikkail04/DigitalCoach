"""
Routes for all LLM tasks such as sentiment analysis.
"""
from fastapi import APIRouter, HTTPException
from schemas import (
    SentimentAnalysisRequest, 
    SentimentAnalysisJobResponse,
    JobId,
    JobStatus
)
from services.orchestrator import start_sentiment_analysis
from utils.logger_config import get_logger
from redisStore.myconnection import get_redis_con
from rq.job import Job

logger = get_logger(__name__)
router = APIRouter(prefix="/api/llm", tags=["LLM"])

# POST /api/llm/sentiment
@router.post(
    "/sentiment",
    response_model=JobId,
    summary="Starts a sentiment analysis job on the given interview id.",
    description="Adds sentiment analysis job to LLM for the given interview id. Returns the job's id for polling."
)
async def sentiment_analysis(request: SentimentAnalysisRequest) -> JobId: 
    # start audio analysis job
    job_id = start_sentiment_analysis(request)

    return JobId(job_id=job_id)


# GET /api/llm/sentiment/{job_id}
@router.get(
    "/sentiment/{job_id}",
    response_model=SentimentAnalysisJobResponse,
    summary="Polls sentiment analysis job",
    description="Checks if the given sentiment analysis job is completed or not and returns the job status as well as the result if completed."
)
async def poll_sentiment_job(job_id: str):
    # poll job
    try:
        redis_conn = get_redis_con()
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error polling job: {e}")
    
    if job.is_finished:
        print(f"Sentiment job={job_id} compeleted: {job.result.model_dump()}")
        # job result will SentimentAnalysisResult object
        return SentimentAnalysisJobResponse(
            status=JobStatus.COMPLETED,
            result=job.result,
        )
    elif job.is_failed:
        return SentimentAnalysisJobResponse(
            status=JobStatus.FAILED,
            error=str(job.exc_info)
        )
    else:
        # job is still processing
        return SentimentAnalysisJobResponse(
            status=JobStatus.PROCESSING,
        )