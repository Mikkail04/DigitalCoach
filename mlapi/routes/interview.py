from fastapi import APIRouter, HTTPException, status
from utils.logger_config import get_logger
from schemas import (
    CreateInterviewResponse, 
    CreateInterviewRequest,
    AnalyzeInterviewRequest, 
    GetInterviewResponse,
    Interview
)
from data.interviews import (
    getUserInterviews,
    getInterviewById,
    createInterview,
)

from services.orchestrator import start_interview_analysis 

logger = get_logger(__name__) # create a logger instance to log messages

router = APIRouter(prefix="/api/interview", tags=["interview"])
# POST /api/interview
@router.post(
    "/",
    response_model=CreateInterviewResponse,
    summary="Create partially populated interview given after user finishes their interview.",
    description="Creates interview document populated with initial data from user's interview before it gets analyzed. Then, perform analysis tasks.",
)
async def create_interview(request: CreateInterviewRequest):
    logger.info(f"Attempting to create new interview document for user={request.userId}...")
    
    await createInterview(request.userId, request.interview) # create user interview (performs exception handling)

    # start interview analysis tasks
    try:
        logger.info(f"Starting analysis on interview={request.interview.id} for user={request.userId}")

        # Start analysis jobs on interview
        analysisRequest = AnalyzeInterviewRequest(
            user_id=request.userId, 
            interview_id=request.interview.id
        )

        response = start_interview_analysis(analysisRequest) # start interview analysis and get the analysis job ids

        logger.info(f"Analysis tasks on interview={request.interview.id} for user={request.userId} enqueued!")

        return CreateInterviewResponse(sentiment_job_id=response.sentiment_job_id,
                                       star_job_id=response.star_job_id, competency_job_id=response.competency_job_id,
                                       overall_job_id=response.overall_job_id,
                                       filler_hedge_job_id=response.filler_hedge_job_id,
                                       success=True)
    except Exception as e:
        logger.error(f"Unexpected internal server error occurred during interview analysis id={request.interview.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interview has been saved in the database. But an unexpected internal server error occurred during interview analysis."
        )

# GET /api/interview/{user_id}/{interview_id}
@router.get(
    "/{user_id}/{interview_id}/",
    response_model=GetInterviewResponse,
    summary="Get interview document given user and interview id.",
    description="Retrieves an interview document with a given id from a user with a given id.",
)
async def get_interview(user_id: str, interview_id: str) -> GetInterviewResponse:

    # validate ids

    interview = await getInterviewById(user_id, interview_id) # get user's interview (performs exception handling)
    
    return GetInterviewResponse(interview=interview)
    

# GET /api/interview/{user_id}
@router.get(
    "/{user_id}",
    summary="Get all of a specific user's fully analyzed interviews.",
    description="Get all analyzed interview documents belonging to a specific user.",
)
async def get_interviews(user_id: str) -> list[Interview]:
    logger.info(f"Getting all the analyzed interviews for user id={user_id}")

    
    # validate user_id


    # get user interviews
    interviews = await getUserInterviews(user_id)
    return interviews # return interviews
    
