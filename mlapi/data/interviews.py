"""
Data functions related to interviews.
"""

from services.firebase_init import get_firestore_client
from utils.logger_config import get_logger
from schemas.interview import Interview
from pydantic import ValidationError
from google.cloud import firestore
from fastapi import HTTPException, status

logger = get_logger(__name__)
  
async def createInterview(userId: str, interview: Interview):
    """
    Creates interview document populated with initial data from user's interview before it gets analyzed.

    - **userId**: (str) user's id from Firebase Authentication.
    - **interview**: (Interview) Interview partially filled interview to insert.
    """

    db = get_firestore_client()
    logger.info(f"Attempting to create new interview document for user={userId}...")
    # convert interview pydantic object into a dictionary 
    interviewData = interview.model_dump()
    try:
        # check if user exists
        userRef = db.collection("users").document(userId)
        userDoc = await userRef.get()
        if (not userDoc.exists):
            logger.error(f"Can't find user with id={userId}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        
        logger.info(f"User {userId} found!")
        
        # get reference to user's interview collection
        interviewRef = userRef.collection("interviews")
        
        # add interview document to user's interview using the given interview id
        await interviewRef.document(interviewData['id']).set(interviewData)

        logger.info(f"Inserted new interview={interviewData['id']}!")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create interview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create interview."
        )

async def getTranscriptById(user_id: str, interview_id: str) -> str:
    """
    Returns the transcript with the given interview id from the given user.

    Args:
        user_id (str): Id of the user that owns the interview transcript
        interview_id (str): Id of the interview we're extracting the transcript from
    """

    try:
        db = get_firestore_client()
        # get user's document reference
        userRef = db.collection("users").document(f"{user_id}")

        userDoc = await userRef.get()
        if not userDoc.exists:
            logger.error(f"User with user_id={user_id} not found.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        # get interview document reference
        transcriptRef = userRef.collection("interviews").document(interview_id)

        # get interview document
        interviewDoc = await transcriptRef.get()
        if (interviewDoc.exists):
            transcript = interviewDoc.to_dict()["transcript"]
            logger.info(f"Interview transcript with id={interview_id} found!")
            return transcript
        else:
            logger.error(f"Can't find transcript for interview={interview_id}")
            raise AttributeError(f"Can't find transcript for interview={interview_id}")
    except Exception as e:
        raise AttributeError(f"Error getting transcript for interview={interview_id}. Reason: {e}")

async def getUserInterviews(user_id: str) -> list[Interview]:
    """
    Returns a list of all the user's interviews that are analyzed.
    """
    db = get_firestore_client() # get firestore instance
    interviews = [] # list of user's analyzed interviews

    try:

        # get user's document 
        userRef = db.collection("users").document(user_id)
        userDoc = await userRef.get()
        
        # get() doesn't throw an exception so we use the exists property to determine if the user document exists
        if (not userDoc.exists):
            logger.error(f"User with user_id={user_id} not found.")
            raise HTTPException (
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        
        logger.info(f"User id={user_id} found!")
        
        # get analyzed interviews from interview collection
        interviewCol = (userRef.collection("interviews")
                        .where(filter=firestore.FieldFilter("is_analyzed", "==" , True))
                        .order_by("timestamp", direction=firestore.Query.DESCENDING)
                        .stream()) # get all interviews from collection in descending order based on their creation timestamp 
         
        # iterate through each analyzed interview document
        async for interviewDoc in interviewCol:
            interview_data = interviewDoc.to_dict() # convert document into dictionary
            
            # verify the interview data matches Pydantic interview schema's shape and then add it to the list as an interview instance if valid
            try:
                valid_interview = Interview.model_validate(interview_data)
                interviews.append(valid_interview) 
            except ValidationError as e:
                # interviews that don't follow the proper shape will not be added to the list regardless if they've been analyzed 
                logger.error(f"Interview id={interviewDoc.id} doesn't follow the Pydantic schema: {e}")
        return interviews # return list of all interviews
    except HTTPException:
        raise # re-raise exception for FastAPI to handle
    except Exception as e:
        logger.error(f"Internal server error occurred when getting interviews: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurred when getting interviews."
        )

async def getInterviewById(user_id: str, interview_id: str) -> Interview:
    """
    Retrieves an interview document with a given id from a user with a given id.

    Returns:
        interview (Interview): The inteview wrapped within the Interview Pydantic schema
    """

    db = get_firestore_client() # get firestore client
    logger.info(f"Attempting to retrieve interview document with id {interview_id} from user={user_id}...")
    

    try:

        # verify user exists
        userRef = db.collection("users").document(user_id)
        userDoc = await userRef.get()

        # since get() doesn't throw an exception, we check its exists property
        if (not userDoc.exists):
            logger.error(f"Can't find user with id={user_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
            
        logger.info(f"User={user_id} found!")
        # verify that interview exists
        interviewDoc = await userRef.collection("interviews").document(interview_id).get()
        if (not interviewDoc.exists):
            logger.error(f"Can't find interview with id={interview_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found."
            )
            
        logger.info(f"Interview={interview_id} found!")
        interviewData = interviewDoc.to_dict() # convert document/snapshot into a Python dictionary
        # verify that the interview data follows our Pydantic schema before returning
        try:
            interview = Interview.model_validate(interviewData) 
            logger.info("Interview follows Pydantic schema")
            return interview
        except ValidationError as e:
            logger.error(f"Interview doesn't follow Pydantic schema: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Interview shape malformed within the database."
            )
        
    except HTTPException:
        raise 
    except Exception as e:
        logger.error(f"Internal server error occurred when getting interview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred when getting interview."
        )

async def setIsAnalyzed(user_id: str, interview_id: str): 
    """
    Set the is_analyzed flag for an interview to true to show that the interview is done being analyzed.

    Args:
        user_id (str): Id of the user who owns the intervivew.
        interview_id (str): Id of the interview whose analysis is complete.
    """
    db = get_firestore_client()

    try:
        # verify user exists
        userRef = db.collection("users").document(user_id)
        userDoc = await userRef.get()

        # since get() doesn't throw an exception, we check its exists property
        if (not userDoc.exists):
            logger.error(f"Can't find user with id={user_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
            
        logger.info(f"User={user_id} found!")
        # verify that interview exists
        interviewRef = userRef.collection("interviews").document(interview_id) # get interview reference
        interviewDoc = await interviewRef.get()
        if (not interviewDoc.exists):
            logger.error(f"Can't find interview with id={interview_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found."
            )
            
        logger.info(f"Interview={interview_id} found!")

        # set the is_analyzed flag to true
        await interviewRef.update({"is_analyzed": True})
        return
    except HTTPException:
        raise 
    except Exception as e:
        logger.error(f"Internal server error occurred when getting interview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred when getting interview."
        )
